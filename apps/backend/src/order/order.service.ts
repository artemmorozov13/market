import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthJwtPayload } from '@core/types/user-type';
import { TelegramService } from 'src/telegram/telegram.service';
import { formatUserOrderMessage } from './notifications/formatUserOrderMessage';
import { exportToExcelWithInnerTable } from './export-generator/export-excel-with-inner-table';
import { exportToWideFormatExcel } from './export-generator/export-to-wide-format-excel';
import { formatUpdatedOrderMessage } from './notifications/formatUpdatedOrderMessage';
import { CancelUserOrderDto } from './dto/cancel-user-order-dto';
import { cancelOrderByUserMessage } from './notifications/cancelOrderByUserMessage';
import { OrderStatusEnum } from '@core/enums/order-status-enum';
import { AdminUpdateOrderStatusDto } from './dto/admin-update-order-status.dto';
import { UsersService } from '@app/users/users.service';
import { ProductStatusEnum } from '@core/enums/product-status-enum';
import { StoreService } from '@app/store/store.service';
import { DeliveryStrategyEnum } from '@core/enums/delivery-strategy.enum';
import { DeliveryArea, DeliveryStrategy, DeliveryTime, OrderedProductsEntity, OrderEntity, PickupPointEntity, ProductEntity, SelectedProductEntity, UsersEntity } from '@core/entities';
import { sendStoreNotification } from './notifications/store-order-notification';
import { getOrderStatusUpdateMessage } from './notifications/admin-order-status-change.message';

@Injectable()
export class OrderService {
  constructor(
    private telegramService: TelegramService,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(SelectedProductEntity)
    private readonly selectedProductsRepository: Repository<SelectedProductEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(OrderedProductsEntity)
    private readonly orderedProductsRepository: Repository<OrderedProductsEntity>,
    @InjectRepository(DeliveryArea)
    private readonly deliveryAreaRepository: Repository<DeliveryArea>,
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,
    @InjectRepository(DeliveryStrategy)
    private readonly deliveryStrategyRepository: Repository<DeliveryStrategy>,
    @InjectRepository(PickupPointEntity)
    private readonly pickupPointRepository: Repository<PickupPointEntity>,
    private readonly userService: UsersService,
    private readonly storeService: StoreService
  ) {}

  async getOrdersListData(userJwt: AuthJwtPayload, options: GetOrderQueryDto) {
    const { limit = 10, skip, deliveryAreaId } = options;
    const whereOptions: FindOptionsWhere<OrderEntity> = {
      store: {
        id: userJwt.storeId
      }
    };

    if (deliveryAreaId) {
        const pointIds = Array.isArray(deliveryAreaId) 
            ? deliveryAreaId 
            : [deliveryAreaId];
        
        if (pointIds.length > 0) {
            whereOptions.deliveryArea = In(pointIds);
        }
    }

    const [items, total] = await this.orderRepository.findAndCount({
        skip: skip,
        take: limit,
        order: {
          updatedAt: "DESC"
        },
        where: whereOptions,
        relations: [
            "user",
            "ordered_products.product",
            "deliveryArea",
            'pickupPoint',
            "deliveryTime",
        ]
    });

    return {
        items: items,
        pagination: {
            total,
            limit,
            skip,
            hasMore: skip + limit < total,
        },
    };
  }

  async getCurrentUserOrders(userJwt: AuthJwtPayload): Promise<OrderEntity[]> {
    return await this.orderRepository.find({
      where: { 
        user: { id: userJwt.id },
      },
      relations: [
        'ordered_products',
        'ordered_products.product',
        'deliveryTime',
        'deliveryArea',
        'pickupPoint',
        'pickupPoint.workingHours',
        'store',
      ],
      order: {
        createdAt: "DESC",
      }
    });
  }

  async cancelOrderByUser(cancelUserOrderDto: CancelUserOrderDto, userData: AuthJwtPayload) {
    const user = await this.userService.getUserById(userData.id)
    const order = await this.orderRepository.findOne({
      where: {
        id: cancelUserOrderDto.orderId,
        user: {
          id: user.id
        },
        status: In([OrderStatusEnum.Created, OrderStatusEnum.WaitForPay])
      },
      relations: ['user', 'ordered_products', 'store'] // Подгружаем связанные данные
    });

    if (!order) {
      throw new BadRequestException(
        `Не удалось отменить заказ ${cancelUserOrderDto.orderId}. ` +
        `Возможно, заказ не существует или уже был отменен/завершен.`
      );
    }

    // Проверяем, можно ли отменить заказ (дополнительная бизнес-логика)
    if (order.status === OrderStatusEnum.Finished) {
      throw new BadRequestException("Нельзя отменить уже завершенный заказ");
    }

    // Обновляем статус заказа
    order.status = OrderStatusEnum.CanceledByUser;
    order.updatedAt = new Date();

    try {
      await this.orderRepository.save(order);

      if (order.user.telegram_id) {
        const userMessage = cancelOrderByUserMessage(order);
        await this.telegramService.sendMessage(
            order.user.telegram_id.toString(),
            userMessage
        );
      }

      return {
        success: true,
        message: `Заказ №${order.id} успешно отменен`,
        orderId: order.id
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Произошла ошибка при отмене заказа: ${error.message}`
      );
    }
  }

  async adminUpdateOrdersStatus(userJwt: AuthJwtPayload, updateStatusDto: AdminUpdateOrderStatusDto) {
    const { orderIds, status, cancelReason } = updateStatusDto;
    
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
      relations: ['user']
    });

    if (!orders.length) {
      throw new NotFoundException("Заказы не найдены");
    }

    const allowedStatuses = [
      OrderStatusEnum.CancelByAdmin,
      OrderStatusEnum.Finished,
      OrderStatusEnum.Created,
      OrderStatusEnum.WaitForPay,
      OrderStatusEnum.Confirmed,
      OrderStatusEnum.Assembly,
      OrderStatusEnum.OnTheWay,
      OrderStatusEnum.ReadyForDelivery,
      OrderStatusEnum.TransferredToDelivery
    ];
    
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(`Допустимые статусы: ${allowedStatuses.join(', ')}`);
    }

    await this.orderRepository.update(
      { id: In(orderIds) },
      { 
        status: status,
        cancelReason
      }
    );

    // Отправляем уведомление при любом изменении статуса
    const notifications = orders.map(order => ({
      chatId: order.user.telegram_id.toString(),
      message: getOrderStatusUpdateMessage(order, status, cancelReason)
    }));

    return await this.telegramService.sendBatchMessages(notifications);
  }
  
  async createOrder(createOrderDto: CreateOrderDto, userJwt: AuthJwtPayload) {
    const user = await this.userService.getUserById(userJwt.id);
    const store = await this.storeService.getStoreDataById(createOrderDto.storeId);

    // Получаем стратегию доставки
    const deliveryStrategy = await this.deliveryStrategyRepository.findOne({
        where: { type: createOrderDto.deliveryStrategy }
    });

    if (!deliveryStrategy) {
        throw new NotFoundException('Стратегия доставки не найдена');
    }

    // Проверка режима работы магазина
    const { available, reason } = await this.storeService.isDeliveryDateAvailable(
        store,
        new Date(createOrderDto.deliveryDate),
        createOrderDto.deliveryTimeId
    );

    if (!available) {
        throw new BadRequestException(reason);
    }

    // Проверка количества активных заказов
    const activeOrdersCount = await this.orderRepository.count({
        where: {
            user: { id: userJwt.id },
            store: { id: store.id },
            status: In([
              OrderStatusEnum.Created,
              OrderStatusEnum.WaitForPay
            ])
        }
    });

    if (activeOrdersCount >= 3) {
        throw new BadRequestException("Нельзя иметь более 3 активных заказов");
    }

    // Проверка на существующий заказ на ту же дату
    const existingOrderOnSameDate = await this.orderRepository.findOne({
        where: {
            user: { id: userJwt.id },
            store: { id: store.id },
            deliveryDate: new Date(createOrderDto.deliveryDate),
            status: In([
              OrderStatusEnum.Created,
              OrderStatusEnum.WaitForPay
            ])
        }
    });

    if (existingOrderOnSameDate) {
        throw new BadRequestException("У вас уже есть заказ на выбранную дату");
    }

    // Получаем товары из корзины
    const selectedProducts = await this.selectedProductsRepository.find({
        where: {
            user: { id: userJwt.id },
            store: { id: store.id },
            product: {
                status: In([ProductStatusEnum.Accepted, ProductStatusEnum.Active])
            }
        },
        relations: ["product"]
    });

    if (!selectedProducts.length) {
        throw new BadRequestException("Корзина пустая");
    }

    // Подготовка данных для заказа
    let deliveryArea: DeliveryArea | null = null;
    let deliveryTime: DeliveryTime | null = null;
    let pickupPoint: PickupPointEntity | null = null;
    let fullAddress = '';
    let address = '';

    if (deliveryStrategy.type === DeliveryStrategyEnum.DeliveryToEntrance) {
        if (!createOrderDto.address?.fullAddress?.trim()) {
            throw new BadRequestException("Необходимо указать полный адрес доставки");
        }

        deliveryArea = await this.deliveryAreaRepository.findOne({
            where: { id: createOrderDto.deliveryAreaId, store: { id: store.id } }
        });

        if (!deliveryArea) {
            throw new NotFoundException('Зона доставки не найдена');
        }

        deliveryTime = await this.deliveryTimeRepository.findOne({
            where: { id: createOrderDto.deliveryTimeId }
        });

        if (!deliveryTime) {
            throw new NotFoundException('Время доставки не найдено');
        }

        // Формируем полный адрес с деталями
        const addressParts = [createOrderDto.address.fullAddress];
        
        if (createOrderDto.address.entrance) {
            addressParts.push(`подъезд ${createOrderDto.address.entrance}`);
        }
        
        if (createOrderDto.address.floor) {
            addressParts.push(`этаж ${createOrderDto.address.floor}`);
        }
        
        if (createOrderDto.address.apartment) {
            addressParts.push(`квартира ${createOrderDto.address.apartment}`);
        }
        
        fullAddress = addressParts.join(', ');
        address = createOrderDto.address.fullAddress;

    } else if (deliveryStrategy.type === DeliveryStrategyEnum.PickupByYourself) {
        if (!createOrderDto.pickupPointId) {
            throw new BadRequestException("Не выбран пункт самовывоза");
        }

        pickupPoint = await this.pickupPointRepository.findOne({
            where: { id: createOrderDto.pickupPointId, store: { id: store.id } }
        });

        if (!pickupPoint) {
            throw new NotFoundException('Пункт самовывоза не найден');
        }

        address = `Самовывоз: ${pickupPoint.name}`;
        fullAddress = pickupPoint.fullAddress;
    }

    // Расчет общей суммы с учетом скидок
    const subtotal = selectedProducts.reduce((acc, product) => {
        const price = product.product.price;
        const discount = product.product.discount || 0;
        const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
        return acc + (discountedPrice * product.quantity);
    }, 0);
    
    const deliveryCost = deliveryStrategy.type === DeliveryStrategyEnum.DeliveryToEntrance && 
                        subtotal < store?.deliveryFreeFromLimit 
        ? store.deliveryCost 
        : 0;
    
    const totalAmount = subtotal + deliveryCost;

    // Создание заказа
    const order = this.orderRepository.create({
        address,
        fullAddress,
        phoneNumber: createOrderDto.phone,
        comment: createOrderDto.comment,
        deliveryDate: deliveryStrategy.type === DeliveryStrategyEnum.DeliveryToEntrance ? new Date(createOrderDto.deliveryDate) : null,
        status: OrderStatusEnum.Created,
        orderDeliveryStrategy: deliveryStrategy.type,
        totalAmount,
        deliveryArea,
        deliveryTime,
        pickupPoint,
        user: { id: userJwt.id },
        store: { id: createOrderDto.storeId }
    });

    const savedOrder = await this.orderRepository.save(order);

    // Создание записей о заказанных товарах
    const orderedProducts = selectedProducts.map((selectedProduct) => {
        return this.orderedProductsRepository.create({
            product: selectedProduct.product,
            quantity: selectedProduct.quantity,
            user: { id: userJwt.id },
            order: savedOrder,
        });
    });

    await this.orderedProductsRepository.save(orderedProducts);
    
    // Очистка корзины
    await this.selectedProductsRepository.delete({
        user: { id: user.id },
        store: { id: store.id }
    });

    store.staff.forEach((person) => {
      if (person?.telegram_id) {
        sendStoreNotification(
            this.telegramService,
            store,
            savedOrder,
            orderedProducts,
            user,
            person.telegram_id.toString()
        );
    }
    })

    if (user.telegram_id) {
      const userMessage = formatUserOrderMessage(savedOrder, orderedProducts, savedOrder.deliveryArea, savedOrder.deliveryTime, store);
      await this.telegramService.sendMessage(
          user.telegram_id.toString(),
          userMessage
      );
    }

    return savedOrder;
  }

  async updateOrder(
    updateOrderDto: UpdateOrderDto,
    userJwt: AuthJwtPayload
  ): Promise<OrderEntity> {
      const user = await this.userService.getUserById(userJwt.id)

      if (!updateOrderDto.products.length) {
          throw new BadRequestException("Вы не можете удалить все товары")
      }
    
      const order = await this.orderRepository.findOne({
          where: {
              id: updateOrderDto.id,
          },
          relations: [
              'store',
              'ordered_products',
              'ordered_products.product'
          ]
      });
    
      if (!order) {
          throw new NotFoundException("Заказ не найден");
      }
    
      if (order.status !== "waitForPay") {
          throw new BadRequestException("Изменение заказа возможно только в статусе 'Ожидает оплаты'");
      }
    
      // Обрабатываем товары в заказе
      const selectedProducts = updateOrderDto.products.map(product => product.productId);
      const availableProducts = await this.productRepository.find({
          where: {
              id: In(selectedProducts),
              store: {
                  id: order.store.id
              }
          }
      });
    
      const normalizedProducts = availableProducts.reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
      }, {} as Record<number, ProductEntity>);
    
      const isSomeExpired = availableProducts.some(product => product.status === ProductStatusEnum.Expired || product.status === ProductStatusEnum.Revoked);
    
      if (isSomeExpired) {
          throw new BadRequestException("В списке присутствует недоступный товар");
      }
    
      // Расчет суммы с учетом скидок
      const subtotal = updateOrderDto.products.reduce((amount, current) => {
          const product = normalizedProducts[current.productId];
          if (!product) return amount;
          
          const discount = product.discount || 0;
          const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
          return amount + (discountedPrice * current.quantity);
      }, 0);
    
      // Расчет стоимости доставки
      const deliveryCost = order.orderDeliveryStrategy === DeliveryStrategyEnum.DeliveryToEntrance && 
                          subtotal < order.store.deliveryFreeFromLimit
          ? order.store.deliveryCost
          : 0;
    
      // Удаляем старые товары заказа
      await this.orderedProductsRepository.delete({ order: { id: order.id } });
    
      // Создаем новые товары заказа (без циклических ссылок)
      const orderedProducts = updateOrderDto.products
          .filter(product => product.quantity > 0)
          .map(product => ({
              quantity: product.quantity,
              telegram_id: user.telegram_id,
              product: { id: product.productId },
              order: { id: order.id },
              user: { id: user.id },
          }));
    
      // Сохраняем товары
      const savedProducts = await this.orderedProductsRepository.save(orderedProducts);
    
      // Обновляем заказ с учетом скидок и доставки
      order.totalAmount = subtotal + deliveryCost;
      order.ordered_products = savedProducts;
    
      const savedOrder = await this.orderRepository.save(order);
    
      const updatedOrder = await this.orderRepository.findOne({
          where: {
              id: savedOrder.id
          },
          relations: [
              'ordered_products',
              'ordered_products.product',
              'deliveryArea',
              'deliveryTime',
              'store'
          ],
          loadEagerRelations: false
      });

      if (user?.telegram_id) {
          const userMessage = formatUpdatedOrderMessage(updatedOrder);
          await this.telegramService.sendMessage(
              user.telegram_id.toString(),
              userMessage
          );
      }

      return updatedOrder;
  }
  
  async exportExcelWithInnerTable(userJwt: AuthJwtPayload, deliveryAreaIds?: number[]): Promise<Uint8Array> {
    const whereOptions: FindOptionsWhere<OrderEntity> = { 
        status: In[
          OrderStatusEnum.Created,
          OrderStatusEnum.WaitForPay
        ],
        store: {
          id: userJwt.storeId
        }
    };

    if (deliveryAreaIds && deliveryAreaIds.length > 0) {
        whereOptions.deliveryArea = In(deliveryAreaIds);
    }

    const orders = await this.orderRepository.find({
        where: whereOptions,
        relations: [ 
            'ordered_products',
            'ordered_products.product',
            'deliveryTime',
            'deliveryArea'
        ]
    });
    return exportToExcelWithInnerTable({ orders });
  }

  async exportToWideFormatExcel(userJwt: AuthJwtPayload, deliveryAreaIds?: number[]): Promise<Uint8Array> {
      const whereOptions: FindOptionsWhere<OrderEntity> = { 
          status: In[
            OrderStatusEnum.Created,
            OrderStatusEnum.WaitForPay
          ],
          store: {
            id: userJwt.storeId
          }
      };

      // Добавляем фильтрацию по пунктам выдачи, если они переданы
      if (deliveryAreaIds && deliveryAreaIds.length > 0) {
          whereOptions.deliveryArea = In(deliveryAreaIds);
      }

      const products = await this.productRepository.find({
          where: {
              status: In([ProductStatusEnum.Accepted, ProductStatusEnum.Active]),
              store: {
                id: userJwt.storeId
              }
          },
          order: {
            updatedAt: "DESC"
          }
      });

      const orders = await this.orderRepository.find({
          where: whereOptions,
          relations: [ 
              'ordered_products',
              'ordered_products.product',
              'deliveryTime',
              'deliveryArea',
              'pickupPoint'
          ]
      });

      return exportToWideFormatExcel({ orders, products });
  }
}

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
import { OrderEntity } from '@core/entities/order.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';
import { ProductEntity } from '@core/entities/product.entity';
import { OrderedProductsEntity } from '@core/entities/ordered-products.entity';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { OrderStatusEnum } from '@core/enums/order-status-enum';
import { OrderStoreResolver } from './lib/order-store-resolver';
import { AdminUpdateOrderStatusDto } from './dto/admin-update-order-status.dto';
import { getCanceledByAdminMessage } from './notifications/admin-order-status-change.message';
import { UsersService } from '@app/users/users.service';
import { StoreUserService } from '@app/store-user/store-user.service';
import { ProductStatusEnum } from '@core/enums/product-status-enum';
import { StoreService } from '@app/store/store.service';
import { DeliveryArea } from '@core/entities/delivery-area.entity';

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
    private readonly orderStoreResolver: OrderStoreResolver,
    private readonly storeUserService: StoreUserService,
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
            "deliveryTime"
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
        'store'
      ],
      order: {
        deliveryDate: "DESC",
        createdAt: "DESC"
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
        status: In([OrderStatusEnum.WaitForPay])
      },
      relations: ['user', 'ordered_products'] // Подгружаем связанные данные
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

    const allowedStatuses = [OrderStatusEnum.CancelByAdmin, OrderStatusEnum.Finished, OrderStatusEnum.WaitForPay];
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

    if (status === OrderStatusEnum.CancelByAdmin) {
      const notifications = orders.map(order => ({
        chatId: order.user.telegram_id.toString(),
        message: getCanceledByAdminMessage(order, cancelReason)
      }));

      return await this.telegramService.sendBatchMessages(notifications);
    }
  }
  
  async createOrder(createOrderDto: CreateOrderDto, userJwt: AuthJwtPayload) {
    const store = await this.storeService.getStoreDataById(createOrderDto.storeId);
    const user = await this.userService.getUserById(userJwt.id)

    const activeOrdersCount = await this.orderRepository.count({
      where: {
        user: user,
        store,
        status: OrderStatusEnum.WaitForPay
      }
    });

    if (activeOrdersCount >= 3) {
      throw new BadRequestException("Нельзя иметь более 3 активных заказов");
    }

    // Проверяем, есть ли уже заказ на выбранную дату
    const existingOrderOnSameDate = await this.orderRepository.findOne({
      where: {
        user: user,
        store,
        deliveryDate: createOrderDto.deliveryDate,
        address: createOrderDto.address,
        status: OrderStatusEnum.WaitForPay
      }
    });

    if (existingOrderOnSameDate) {
      throw new BadRequestException("У вас уже есть заказ на выбранную дату по этому адресу");
    }

    const selectedProducts = await this.selectedProductsRepository.find({
      where: {
        user: {
          id: user.id
        },
        store: {
          id: store.id
        },
        product: {
          status: In([ProductStatusEnum.Accepted, ProductStatusEnum.Active])
        }
      },
      relations: ["product"]
    });

    if (!selectedProducts.length) {
      throw new BadRequestException("Корзина пустая");
    }

    const deliveryArea = await this.deliveryAreaRepository.findOne({
      where: {
        id: createOrderDto.deliveryAreaId,
        store: {
          id: store.id
        }
      }
    });

    if (!deliveryArea) {
      throw new NotFoundException('Пункт выдачи не найден');
    }

    // Получаем объект DeliveryTime по ID
    const deliveryTime = await this.deliveryTimeRepository.findOne({
      where: {
        id: createOrderDto.deliveryTimeId
      }
    });

    if (!deliveryTime) {
      throw new NotFoundException('Время доставки не найдено');
    }

    const totalAmount = selectedProducts.reduce(
      (acc, product) => (acc + product.quantity * product.product.price),
      0
    )

    const order = this.orderRepository.create({
      address: createOrderDto.address,
      fullAddress: createOrderDto.fullAddress,
      phoneNumber: createOrderDto.phoneNumber,
      comment: createOrderDto.comment,
      deliveryDate: createOrderDto.deliveryDate,
      status: OrderStatusEnum.WaitForPay,
      totalAmount: totalAmount < store.deliveryFreeFromLimit ? totalAmount + store.deliveryCost : totalAmount,
      deliveryArea: deliveryArea,
      deliveryTime: deliveryTime,
      user: user,
      store: store
    });

    const savedOrder = await this.orderRepository.save(order);

    const orderedProducts = selectedProducts.map((selectedProduct) => {
      return this.orderedProductsRepository.create({
        product: selectedProduct.product,
        quantity: selectedProduct.quantity,
        telegram_id: user.telegram_id,
        user: user,
        order: savedOrder,
      });
    });

    await this.orderedProductsRepository.save(orderedProducts);
    await this.selectedProductsRepository.delete({
      user: {
        id: user.id
      },
      store: {
        id: store.id
      }
    });

    if (user.telegram_id) {
      const userMessage = formatUserOrderMessage(order, orderedProducts, deliveryArea, deliveryTime);
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
  
    // Правильный расчет суммы
    const totalAmount = updateOrderDto.products.reduce((amount, current) => {
      const product = normalizedProducts[current.productId];
      return product ? amount + (product.price * current.quantity) : amount;
    }, 0);
  
    // Удаляем старые товары заказа
    await this.orderedProductsRepository.delete({ order: { id: order.id } });
  
    // Создаем новые товары заказа (без циклических ссылок)
    const orderedProducts = updateOrderDto.products
      .filter(product => product.quantity > 0)
      .map(product => ({
        quantity: product.quantity,
        telegram_id: user.telegram_id,
        product: { id: product.productId },
        order: { id: order.id }, // Только ID, чтобы избежать циклической ссылки
        user: { id: user.id },
      }));
  
    // Сохраняем товары
    const savedProducts = await this.orderedProductsRepository.save(orderedProducts);
  
    // Обновляем заказ
    order.totalAmount = totalAmount < user.store.deliveryFreeFromLimit ? totalAmount + user.store.deliveryCost : totalAmount;
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
      ],
      loadEagerRelations: false
    });

    if (user.telegram_id) {
      const userMessage = formatUpdatedOrderMessage(updatedOrder, savedProducts, updatedOrder.deliveryArea, updatedOrder.deliveryTime);
      await this.telegramService.sendMessage(
          user.telegram_id.toString(),
          userMessage
      );
    }

    return updatedOrder
  }
  
  async exportExcelWithInnerTable(userJwt: AuthJwtPayload, deliveryAreaIds?: number[]): Promise<Uint8Array> {
    const whereOptions: FindOptionsWhere<OrderEntity> = { 
        status: OrderStatusEnum.WaitForPay,
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
          status: OrderStatusEnum.WaitForPay,
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
              'deliveryArea'
          ]
      });

      return exportToWideFormatExcel({ orders, products });
  }
}

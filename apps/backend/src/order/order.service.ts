import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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
import { PickupPoint } from '@core/entities/pickup-point.entity';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { OrderStatusEnum } from '@core/enums/order-status-enum';
import { OrderStoreResolver } from './lib/order-store-resolver';
import { AdminUpdateOrderStatusDto } from './dto/admin-update-order-status.dto';
import { getCanceledByAdminMessage } from './notifications/admin-order-status-change.message';

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
    @InjectRepository(PickupPoint)
    private readonly pickupPointRepository: Repository<PickupPoint>,
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,
    private readonly orderStoreResolver: OrderStoreResolver
  ) {}

  async getOrdersListData(userJwt: AuthJwtPayload, options: GetOrderQueryDto) {
    const store = await this.orderStoreResolver.resolveStore(userJwt);
    const { limit = 10, skip, pickupPointId } = options;
    const whereOptions: FindOptionsWhere<OrderEntity> = {
      store
    };

    // Обрабатываем как массив ID, даже если пришел один ID
    if (pickupPointId) {
        const pointIds = Array.isArray(pickupPointId) 
            ? pickupPointId 
            : [pickupPointId];
        
        if (pointIds.length > 0) {
            whereOptions.pickupPoint = In(pointIds);
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
            "pickupPoint",
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

  async getCurrentUserOrders(userPayload: AuthJwtPayload): Promise<OrderEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userPayload.id },
    });
  
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
  
    return await this.orderRepository.find({
      where: { 
        user: { id: user.id },
      },
      relations: [
        'ordered_products',
        'ordered_products.product',
        'deliveryTime',
        'pickupPoint'
      ],
      order: {
        deliveryDate: "DESC", // Сортировка по убыванию даты
        createdAt: "DESC"     // Дополнительная сортировка по дате создания
      }
    });
  }

  async cancelOrderByUser(cancelUserOrderDto: CancelUserOrderDto, userData: AuthJwtPayload) {
    const order = await this.orderRepository.findOne({
      where: {
        id: cancelUserOrderDto.orderId,
        user: {
          id: userData.id
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
        await this.telegramService.sendHtmlMessage(
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

  async adminUpdateOrdersStatus(updateStatusDto: AdminUpdateOrderStatusDto) {
    const { orderIds, status, cancelReason } = updateStatusDto;
    
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
      relations: ['user', 'store']
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
        chatId: order.user.telegram_id,
        message: getCanceledByAdminMessage(order, cancelReason)
      }));

      return await this.telegramService.sendBatchMessages(notifications);
    }
  }
  
  async createOrder(createOrderDto: CreateOrderDto, userJwt: AuthJwtPayload) {
    const store = await this.orderStoreResolver.resolveStore(userJwt);
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store
      }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    // Проверяем количество активных заказов пользователя
    const activeOrdersCount = await this.orderRepository.count({
      where: {
        user: {
          id: user.id
        },
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
        user: {
          id: user.id
        },
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
        store,
        product: {
          is_expired: false
        }
      },
      relations: ["product"]
    });

    if (!selectedProducts.length) {
      throw new BadRequestException("Корзина пустая");
    }

    const pickupPoint = await this.pickupPointRepository.findOne({
      where: {
        id: createOrderDto.pickupPointId,
        store: store
      }
    });

    if (!pickupPoint) {
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
      pickupPoint: pickupPoint,
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
    await this.selectedProductsRepository.delete({ userTgchatId: user.telegram_id });

    if (user.telegram_id) {
      const userMessage = formatUserOrderMessage(order, orderedProducts, pickupPoint, deliveryTime);
      await this.telegramService.sendHtmlMessage(
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
    const store = await this.orderStoreResolver.resolveStore(userJwt);
    const user = await this.usersRepository.findOne({
      where: {
        id: userJwt.id,
        store
      }
    });
  
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    if (!updateOrderDto.products.length) {
      throw new BadRequestException("Вы не можете удалить все товары")
    }
  
    const order = await this.orderRepository.findOne({
      where: {
        id: updateOrderDto.id,
        user: { id: user.id },
        store
      },
      relations: [
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
        store
      }
    });
  
    const normalizedProducts = availableProducts.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<number, ProductEntity>);
  
    const isSomeExpired = availableProducts.some(product => product.is_expired);
  
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
        product: normalizedProducts[product.productId],
        order: { id: order.id }, // Только ID, чтобы избежать циклической ссылки
        user: { id: user.id },
      }));
  
    // Сохраняем товары
    const savedProducts = await this.orderedProductsRepository.save(orderedProducts);
  
    // Обновляем заказ
    order.totalAmount = totalAmount < store.deliveryFreeFromLimit ? totalAmount + store.deliveryCost : totalAmount;
    order.ordered_products = savedProducts;
  
    const savedOrder = await this.orderRepository.save(order);
  
    const updatedOrder = await this.orderRepository.findOne({
      where: {
        id: savedOrder.id,
        store
      },
      relations: ['ordered_products', 'ordered_products.product', 'deliveryTime'],
      loadEagerRelations: false
    });

    if (user.telegram_id) {
      const userMessage = formatUpdatedOrderMessage(updatedOrder, savedProducts, updatedOrder.pickupPoint, updatedOrder.deliveryTime);
      await this.telegramService.sendHtmlMessage(
          user.telegram_id.toString(),
          userMessage
      );
    }

    return updatedOrder
  }
  
  async exportExcelWithInnerTable(userJwt: AuthJwtPayload, pickupPointIds?: number[]): Promise<Uint8Array> {
    const store = await this.orderStoreResolver.resolveStore(userJwt);
    const whereOptions: FindOptionsWhere<OrderEntity> = { 
        status: OrderStatusEnum.WaitForPay,
        store
    };

    if (pickupPointIds && pickupPointIds.length > 0) {
        whereOptions.pickupPoint = In(pickupPointIds);
    }

    const orders = await this.orderRepository.find({
        where: whereOptions,
        relations: [ 
            'ordered_products',
            'ordered_products.product',
            'deliveryTime',
            'pickupPoint'
        ]
    });
    return exportToExcelWithInnerTable({ orders });
  }

  async exportToWideFormatExcel(userJwt: AuthJwtPayload, pickupPointIds?: number[]): Promise<Uint8Array> {
      const store = await this.orderStoreResolver.resolveStore(userJwt);
      const whereOptions: FindOptionsWhere<OrderEntity> = { 
          status: OrderStatusEnum.WaitForPay,
          store
      };

      // Добавляем фильтрацию по пунктам выдачи, если они переданы
      if (pickupPointIds && pickupPointIds.length > 0) {
          whereOptions.pickupPoint = In(pickupPointIds);
      }

      const products = await this.productRepository.find({
          where: {
              is_expired: false,
              store
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
              'pickupPoint'
          ]
      });

      return exportToWideFormatExcel({ orders, products });
  }
}

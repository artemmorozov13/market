import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from 'src/entities/order.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { OrderedProductsEntity } from 'src/entities/ordered-products.entity';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PickupPoint } from 'src/entities/pickup-point.entity';
import { DeliveryTime } from 'src/entities/delivery-time.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductEntity } from 'src/entities/product.entity';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';
import { TelegramService } from 'src/telegram/telegram.service';
import { formatUserOrderMessage } from './notifications/formatUserOrderMessage';
import { DELIVERY_PRICE } from 'src/utils/constants';
import { exportToExcelWithInnerTable } from './export-generator/export-excel-with-inner-table';
import { exportToWideFormatExcel } from './export-generator/export-to-wide-format-excel';
import { formatUpdatedOrderMessage } from './notifications/formatUpdatedOrderMessage';

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
  ) {}

  async getOrdersListData({ limit = 10, skip, pickupPointId }: GetOrderQueryDto) {
    const whereOptions: FindOptionsWhere<OrderEntity> = {};

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
            createdAt: "DESC"
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
      where: { id: userPayload.sub },
    });
  
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
  
    return await this.orderRepository.find({
      where: { 
        user: { id: user.id },
        status: "waitForPay"
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

  async updateOrderStatus(updateStatusDto: UpdateOrderStatusDto) {
    const { orderId } = updateStatusDto
    return await this.orderRepository.update(orderId, { status: "finished" })
  }
  
  async createOrder(createOrderDto: CreateOrderDto, userData: AuthJwtPayload) {
    const user = await this.usersRepository.findOne({
      where: { id: userData.sub }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    // Проверяем количество активных заказов пользователя
    const activeOrdersCount = await this.orderRepository.count({
      where: {
        user: { id: user.id },
        status: "waitForPay"
      }
    });

    if (activeOrdersCount >= 3) {
      throw new BadRequestException("Нельзя иметь более 3 активных заказов");
    }

    // Проверяем, есть ли уже заказ на выбранную дату
    const existingOrderOnSameDate = await this.orderRepository.findOne({
      where: {
        user: { id: user.id },
        deliveryDate: createOrderDto.deliveryDate,
        address: createOrderDto.address
      }
    });

    if (existingOrderOnSameDate) {
      throw new BadRequestException("У вас уже есть заказ на выбранную дату по этому адресу");
    }

    const selectedProducts = await this.selectedProductsRepository.find({
      where: { userTgchatId: user.telegram_id },
      relations: ["product"]
    });

    if (!selectedProducts.length) {
      throw new BadRequestException("Корзина пустая");
    }

    const pickupPoint = await this.pickupPointRepository.findOne({
      where: { id: createOrderDto.pickupPointId }
    });

    if (!pickupPoint) {
      throw new NotFoundException('Пункт выдачи не найден');
    }

    // Получаем объект DeliveryTime по ID
    const deliveryTime = await this.deliveryTimeRepository.findOne({
      where: { id: createOrderDto.deliveryTimeId }
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
      status: "waitForPay",
      totalAmount: totalAmount + DELIVERY_PRICE,
      pickupPoint: pickupPoint,
      deliveryTime: deliveryTime,
      user: user,
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
    userPayload: AuthJwtPayload
  ): Promise<OrderEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userPayload.sub }
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
        user: { id: user.id }
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
        user: { id: user.id }    // Только ID
      }));
  
    // Сохраняем товары
    const savedProducts = await this.orderedProductsRepository.save(orderedProducts);
  
    // Обновляем заказ
    order.totalAmount = totalAmount + DELIVERY_PRICE;
    order.ordered_products = savedProducts;
  
    const savedOrder = await this.orderRepository.save(order);
  
    // Возвращаем заказ с очищенными циклическими ссылками
    const updatedOrder = await this.orderRepository.findOne({
      where: { id: savedOrder.id },
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
  
  async exportExcelWithInnerTable(pickupPointIds?: number[]): Promise<Uint8Array> {
    const whereOptions: FindOptionsWhere<OrderEntity> = { 
        status: "waitForPay"
    };

    // Добавляем фильтрацию по пунктам выдачи, если они переданы
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

  async exportToWideFormatExcel(pickupPointIds?: number[]): Promise<Uint8Array> {
      const whereOptions: FindOptionsWhere<OrderEntity> = { 
          status: "waitForPay"
      };

      // Добавляем фильтрацию по пунктам выдачи, если они переданы
      if (pickupPointIds && pickupPointIds.length > 0) {
          whereOptions.pickupPoint = In(pickupPointIds);
      }

      const products = await this.productRepository.find({
          where: {
              is_expired: false
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

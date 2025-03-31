import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from 'src/entities/order.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { BasketEntity } from 'src/entities/basket.entity';
import { GetOrderQueryDto } from './dto/get-order-query.dto';
import { OrderedProductsEntity } from 'src/entities/ordered-products.entity';
import { TelegramUtils } from 'src/utils/telegram.utils';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PickupPoint } from 'src/entities/pickup-point.entity';
import { DeliveryTime } from 'src/entities/delivery-time.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(SelectedProductEntity)
    private readonly selectedProductsRepository: Repository<SelectedProductEntity>,
    @InjectRepository(OrderedProductsEntity)
    private readonly orderedProductsRepository: Repository<OrderedProductsEntity>,
    @InjectRepository(PickupPoint)
    private readonly pickupPointRepository: Repository<PickupPoint>,
    @InjectRepository(DeliveryTime)
    private readonly deliveryTimeRepository: Repository<DeliveryTime>,
  ) {}

  async getOrdersListData({ limit = 10, skip }: GetOrderQueryDto) {
    const [items, total] = await this.orderRepository.findAndCount({
      skip: skip,
      take: limit,
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

  async updateOrderStatus(updateStatusDto: UpdateOrderStatusDto) {
    const { orderId } = updateStatusDto
    return await this.orderRepository.update(orderId, { status: "finished" })
  }

  
  async createOrder(createOrderDto: CreateOrderDto, initData: string) {
    const telegramUser = TelegramUtils.parseInitData(initData);
    const user = await this.usersRepository.findOne({
        where: { telegram_id: telegramUser.id }
    });

    if (!user) {
        throw new Error("Пользователь не найден");
    }

    const selectedProducts = await this.selectedProductsRepository.find({
        where: { userTgchatId: telegramUser.id },
        relations: ["product"]
    });

    if (!selectedProducts.length) {
        throw new Error("Корзина пустая");
    }

    // Загружаем пункт выдачи
    const pickupPoint = await this.pickupPointRepository.findOne({
        where: { id: createOrderDto.pickupPointId }
    });

    if (!pickupPoint) {
        throw new NotFoundException('Пункт выдачи не найден');
    }

    // Загружаем время доставки вместе с пунктом выдачи
    const deliveryTime = await this.deliveryTimeRepository.findOne({
        where: { id: createOrderDto.deliveryTimeId },
        relations: ["pickupPoint"] // Явно загружаем связанный пункт выдачи
    });

    if (!deliveryTime) {
        throw new NotFoundException('Время доставки не найдено');
    }

    // Проверяем соответствие пункта выдачи
    if (deliveryTime.pickupPoint.id !== pickupPoint.id) {
        throw new Error('Выбранное время доставки не соответствует пункту выдачи');
    }

    const order = this.orderRepository.create({
        address: createOrderDto.address,
        phoneNumber: createOrderDto.phoneNumber,
        status: "waitForPay",
        comment: createOrderDto.comment,
        user: user,
        pickupPoint: pickupPoint,
        deliveryTime: deliveryTime,
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
    await this.selectedProductsRepository.delete({ userTgchatId: telegramUser.id });

    return savedOrder;
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

@Injectable()
export class OrderService {
  constructor(
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

  private readonly dayOfWeekMap = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0
  };

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

  async getCurrentUserOrders(initData: string): Promise<OrderEntity[]> {
    const telegramUser = TelegramUtils.parseInitData(initData);
    const user = await this.usersRepository.findOne({
      where: { telegram_id: telegramUser.id }
    });
  
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
  
    return this.orderRepository.find({
      where: { 
        user: { id: user.id },
        status: "waitForPay"
      },
      relations: [
        'ordered_products',
        'ordered_products.product',
        'deliveryTime',
        'pickupPoint'
      ]
    });
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
      throw new NotFoundException("Пользователь не найден");
    }

    // Проверяем количество активных заказов пользователя
    const activeOrdersCount = await this.orderRepository.count({
      where: {
        user: { id: user.id },
        status: Not("finished")
      }
    });

    if (activeOrdersCount >= 2) {
      throw new BadRequestException("Нельзя иметь более 2 активных заказов одновременно");
    }

    // Проверяем дату доставки (должна быть в будущем)
    const deliveryDate = new Date(createOrderDto.deliveryDate);
    const currentDate = new Date();
    
    if (deliveryDate <= currentDate) {
      throw new BadRequestException("Дата доставки должна быть в будущем");
    }

    // Проверяем, есть ли уже заказ на выбранную дату
    const existingOrderOnSameDate = await this.orderRepository.findOne({
      where: {
        user: { id: user.id },
        deliveryDate: createOrderDto.deliveryDate
      }
    });

    if (existingOrderOnSameDate) {
      throw new BadRequestException("У вас уже есть заказ на выбранную дату");
    }

    const selectedProducts = await this.selectedProductsRepository.find({
      where: { userTgchatId: telegramUser.id },
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

    const order = this.orderRepository.create({
      address: createOrderDto.address,
      phoneNumber: createOrderDto.phoneNumber,
      status: "waitForPay",
      comment: createOrderDto.comment,
      user: user,
      pickupPoint: pickupPoint,
      deliveryDate: createOrderDto.deliveryDate,
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

  async updateOrder(
    orderId: number,
    updateOrderDto: UpdateOrderDto,
    initData: string
  ): Promise<OrderEntity> {
    const telegramUser = TelegramUtils.parseInitData(initData);
    const user = await this.usersRepository.findOne({
      where: { telegram_id: telegramUser.id }
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    // Получаем заказ со всеми связанными данными
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user: { id: user.id } },
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

    // Проверяем новую дату доставки, если она предоставлена
    if (updateOrderDto.deliveryDate) {
      const newDeliveryDate = new Date(updateOrderDto.deliveryDate);
      const currentDate = new Date();
      
      if (newDeliveryDate <= currentDate) {
        throw new BadRequestException("Новая дата доставки должна быть в будущем");
      }

      // Проверяем, что до текущей даты доставки больше суток
      const oneDayInMs = 24 * 60 * 60 * 1000;
      const currentDeliveryDate = new Date(order.deliveryDate);
      
      if (currentDeliveryDate.getTime() - currentDate.getTime() <= oneDayInMs) {
        throw new BadRequestException(
          "Редактирование заказа доступно только за 24 часа до даты доставки. " +
          `Текущая дата доставки: ${currentDeliveryDate.toLocaleDateString()}`
        );
      }

      order.deliveryDate = updateOrderDto.deliveryDate;
    }

    // Обновляем комментарий, если он предоставлен
    if (updateOrderDto.comment !== undefined) {
      order.comment = updateOrderDto.comment;
    }

    // Обрабатываем товары в заказе
    if (updateOrderDto.products) {
      // Удаляем старые товары, которых нет в новом списке
      const productsToRemove = order.ordered_products.filter(
        op => !updateOrderDto.products.some(p => p.productId === op.product.id)
      );
      
      if (productsToRemove.length > 0) {
        await this.orderedProductsRepository.remove(productsToRemove);
      }

      // Обновляем или добавляем товары
      const updatedProducts = await Promise.all(
        updateOrderDto.products.map(async productDto => {
          const existingProduct = order.ordered_products.find(
            op => op.product.id === productDto.productId
          );

          if (existingProduct) {
            existingProduct.quantity = productDto.quantity;
            return this.orderedProductsRepository.save(existingProduct);
          } else {
            const product = await this.productRepository.findOneBy({ 
              id: productDto.productId 
            });
            
            if (!product) {
              throw new NotFoundException(`Товар с ID ${productDto.productId} не найден`);
            }

            return this.orderedProductsRepository.save(
              this.orderedProductsRepository.create({
                product,
                quantity: productDto.quantity,
                telegram_id: user.telegram_id,
                user,
                order,
              })
            );
          }
        })
      );

      order.ordered_products = updatedProducts;
    }

    return this.orderRepository.save(order);
  }
}

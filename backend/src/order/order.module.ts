import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderEntity } from 'src/entities/order.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { BasketEntity } from 'src/entities/basket.entity';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { OrderedProductsEntity } from 'src/entities/ordered-products.entity';
import { PickupPoint } from 'src/entities/pickup-point.entity';
import { DeliveryTime } from 'src/entities/delivery-time.entity';
import { ProductEntity } from 'src/entities/product.entity';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      UsersEntity,
      SelectedProductEntity,
      OrderedProductsEntity,
      PickupPoint,
      DeliveryTime,
      ProductEntity
    ]),
    AuthModule,
    TelegramModule
  ],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
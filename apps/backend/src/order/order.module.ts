import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { OrderEntity } from '@core/entities/order.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';
import { OrderedProductsEntity } from '@core/entities/ordered-products.entity';
import { PickupPoint } from '@core/entities/pickup-point.entity';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { ProductEntity } from '@core/entities/product.entity';

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
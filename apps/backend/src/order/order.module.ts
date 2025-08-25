import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { OrderStoreResolver } from './lib/order-store-resolver';
import { UsersModule } from '@app/users/users.module';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { StoreModule } from '@app/store/store.module';
import { DeliveryArea, DeliveryStrategy, DeliveryTime, OrderedProductsEntity, OrderEntity, PickupPointEntity, ProductEntity, SelectedProductEntity, UsersEntity } from '@core/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      UsersEntity,
      SelectedProductEntity,
      OrderedProductsEntity,
      DeliveryArea,
      DeliveryTime,
      ProductEntity,
      DeliveryStrategy,
      PickupPointEntity
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => StoreUserModule),
    forwardRef(() => AuthModule),
    forwardRef(() => TelegramModule),
    StoreModule
  ],
  providers: [
    OrderService,
    OrderStoreResolver
  ],
  controllers: [OrderController],
})
export class OrderModule {}
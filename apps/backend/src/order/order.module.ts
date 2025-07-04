import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from 'src/auth/auth.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { OrderEntity } from '@core/entities/order.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';
import { OrderedProductsEntity } from '@core/entities/ordered-products.entity';
import { DeliveryArea } from '@core/entities/delivery-area.entity';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { ProductEntity } from '@core/entities/product.entity';
import { OrderStoreResolver } from './lib/order-store-resolver';
import { UsersModule } from '@app/users/users.module';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { StoreModule } from '@app/store/store.module';
import { DeliveryStrategy } from '@core/entities/delivery-strategy.entity';
import { PickupPointEntity } from '@core/entities/pickup-point.entity';

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
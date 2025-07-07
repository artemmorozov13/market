import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '@core/entities/store.entity';
import { AuthModule } from '@app/auth/auth.module';
import { DeliveryStrategiesModule } from '@app/delivery-strategies/delivery-strategies.module';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StoreEntity,
      DeliveryTime
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreUserModule),
    forwardRef(() => DeliveryStrategiesModule),
    forwardRef(() => UsersModule)
  ],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryStrategiesService } from './delivery-strategies.service';
import { DeliveryStrategy } from '@core/entities/delivery-strategy.entity';
import { StoreDeliveryStrategy } from '@core/entities/store-delivery-strategy.entity';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { DeliveryStrategiesController } from './delivery-strategies.controller';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryStrategy,
      StoreDeliveryStrategy
    ]),
    StoreUserModule,
    forwardRef(() => AuthModule)
  ],
  providers: [DeliveryStrategiesService],
  controllers: [DeliveryStrategiesController],
  exports: [DeliveryStrategiesService],
})
export class DeliveryStrategiesModule {}
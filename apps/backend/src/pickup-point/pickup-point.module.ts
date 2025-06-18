import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupPointController } from './pickup-point.controller';
import { PickupPointService } from './pickup-point.service';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { PickupPoint } from '@core/entities/pickup-point.entity';
import { PickupPointStoreResolver } from './lib/pickup-point-store-resolver';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { UsersModule } from '@app/users/users.module';
import { DeliveryTimesModule } from '@app/delivery-times/delivery-times.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PickupPoint,
      DeliveryTime
    ]),
    StoreUserModule,
    UsersModule,
    AuthModule,
    DeliveryTimesModule
  ],
  controllers: [PickupPointController],
  providers: [
    PickupPointService,
    PickupPointStoreResolver
  ],
})
export class PickupPointModule {}
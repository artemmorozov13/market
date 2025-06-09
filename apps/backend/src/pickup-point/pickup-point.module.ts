import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupPointController } from './pickup-point.controller';
import { PickupPointService } from './pickup-point.service';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { PickupPoint } from '@core/entities/pickup-point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickupPoint, DeliveryTime]),
    AuthModule
  ],
  controllers: [PickupPointController],
  providers: [PickupPointService],
})
export class PickupPointModule {}
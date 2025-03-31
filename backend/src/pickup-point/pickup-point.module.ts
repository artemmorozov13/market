import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupPointController } from './pickup-point.controller';
import { PickupPointService } from './pickup-point.service';
import { PickupPoint } from 'src/entities/pickup-point.entity';
import { DeliveryTime } from 'src/entities/delivery-time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupPoint, DeliveryTime])],
  controllers: [PickupPointController],
  providers: [PickupPointService],
})
export class PickupPointModule {}
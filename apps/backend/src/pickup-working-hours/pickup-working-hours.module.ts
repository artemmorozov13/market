import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupWorkingHoursService } from './pickup-working-hours.service';
import { PickupPointsModule } from '../pickup-points/pickup-points.module';
import { PickupWorkingHoursEntity } from '@core/entities/pickup-working-hours.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickupWorkingHoursEntity]),
    forwardRef(() => PickupPointsModule),
  ],
  providers: [PickupWorkingHoursService],
  controllers: [],
  exports: [PickupWorkingHoursService],
})
export class PickupWorkingHoursModule {}
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupWorkingHoursModule } from '../pickup-working-hours/pickup-working-hours.module';
import { PickupPointEntity } from '@core/entities/pickup-point.entity';
import { PickupPointService } from './pickup-points.service';
import { StoreModule } from '@app/store/store.module';
import { PickupPointsController } from './pickup-points.controller';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PickupPointEntity
    ]),
    forwardRef(() => PickupWorkingHoursModule),
    StoreModule,
    AuthModule
  ],
  providers: [PickupPointService],
  controllers: [PickupPointsController],
  exports: [PickupPointService],
})
export class PickupPointsModule {}
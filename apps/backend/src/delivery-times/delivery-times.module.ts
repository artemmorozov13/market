import { Module } from '@nestjs/common';
import { DeliveryTimesService } from './delivery-times.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { DeliveryTimeStoreResolver } from './lib/delivery-time-store-resolver';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryTime
    ]),
    StoreUserModule,
    UsersModule
  ],
  providers: [DeliveryTimesService, DeliveryTimeStoreResolver],
  controllers: [],
  exports: [DeliveryTimesService]
})
export class DeliveryTimesModule {}

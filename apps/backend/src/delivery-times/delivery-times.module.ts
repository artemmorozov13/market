import { Module } from '@nestjs/common';
import { DeliveryTimesService } from './delivery-times.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { UsersModule } from '@app/users/users.module';
import { StoreModule } from '@app/store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryTime
    ]),
    StoreUserModule,
    UsersModule,
    StoreModule
  ],
  providers: [DeliveryTimesService],
  controllers: [],
  exports: [DeliveryTimesService]
})
export class DeliveryTimesModule {}

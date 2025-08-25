import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAreaController } from './delivery-area.controller';
import { DeliveryAreaService } from './delivery-area.service';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryTime } from '@core/entities/delivery-time.entity';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { UsersModule } from '@app/users/users.module';
import { DeliveryTimesModule } from '@app/delivery-times/delivery-times.module';
import { StoreModule } from '@app/store/store.module';
import { DeliveryArea } from '@core/entities/delivery-area.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryArea,
      DeliveryTime
    ]),
    StoreUserModule,
    UsersModule,
    AuthModule,
    DeliveryTimesModule,
    StoreModule
  ],
  controllers: [DeliveryAreaController],
  providers: [
    DeliveryAreaService,
  ],
})
export class DeliveryAreaModule {}
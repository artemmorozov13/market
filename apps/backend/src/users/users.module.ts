import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BasketModule } from '../basket/basket.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersEntity } from '@core/entities/users.entity';
import { OrderEntity } from '@core/entities/order.entity';
import { StoreModule } from '@app/store/store.module';
import { TelegramUtils } from '@app/utils/telegram.utils';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      OrderEntity
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => BasketModule),
    forwardRef(() => StoreModule),
    CacheModule.register(),
  ],
  providers: [
    UsersService,
    TelegramUtils,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    TelegramUtils,
  ],
})
export class UsersModule {}
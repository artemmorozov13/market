import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { TelegramErrorService } from './telegram-error.service';
import { TelegramErrorNotificationService } from './telegram-error-notification.service';
import { TelegramController } from './telegram.controller';
import { AuthModule } from '../auth/auth.module';
import { OrderEntity } from '@core/entities/order.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { StoreModule } from '@app/store/store.module';
import { BasketModule } from '@app/basket/basket.module';
import { UsersService } from '@app/users/users.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      UsersEntity,
      OrderEntity
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreModule),
    forwardRef(() => BasketModule)
  ],
  providers: [
    UsersService,
    {
      provide: TelegramService,
      useFactory: (usersService: UsersService) => new TelegramService(usersService),
      inject: [UsersService],
    },
    {
      provide: TelegramErrorService,
      useFactory: () => new TelegramErrorService(),
    },
    {
      provide: TelegramErrorNotificationService,
      useFactory: (telegramErrorService: TelegramErrorService) => {
        return new TelegramErrorNotificationService(telegramErrorService);
      },
      inject: [TelegramErrorService],
    },
  ],
  exports: [
    TelegramService,
    TelegramErrorService,
    TelegramErrorNotificationService,
  ],
  controllers: [TelegramController],
})
export class TelegramModule {}
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { TelegramErrorService } from './telegram-error.service';
import { TelegramErrorNotificationService } from './telegram-error-notification.service';
import { TelegramController } from './telegram.controller';
import { UsersService } from '../users/users.service';
import { UsersEntity } from '../entities/users.entity';
import { OrderEntity } from '../entities/order.entity';
import { AuthModule } from '../auth/auth.module';
import { BasketModule } from '../basket/basket.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UsersEntity, OrderEntity]), // Импортируем репозитории напрямую
    forwardRef(() => AuthModule), // Обрабатываем циклические зависимости
    BasketModule,
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
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './telegram.service';
import { TelegramErrorService } from './telegram-error.service';
import { TelegramErrorNotificationService } from './telegram-error-notification.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TelegramService,
      useFactory: () => new TelegramService(),
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
})
export class TelegramModule {}
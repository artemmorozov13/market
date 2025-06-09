import { Injectable } from '@nestjs/common';
import { TelegramErrorService } from './telegram-error.service';

@Injectable()
export class TelegramErrorNotificationService {
  constructor(
    private readonly telegramService: TelegramErrorService,
  ) {}

  async notifyError(error: Error, context?: Record<string, any>): Promise<void> {
    // Отправляем в Telegram
    await this.telegramService.sendErrorNotification(
      error, 
      JSON.stringify(context, null, 2)
    );
    
    // Здесь можно добавить другие способы уведомлений (email, etc.)
  }
}
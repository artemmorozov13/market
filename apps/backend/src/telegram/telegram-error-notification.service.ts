import { Injectable } from '@nestjs/common';
import { TelegramErrorService } from './telegram-error.service';

@Injectable()
export class TelegramErrorNotificationService {
  constructor(
    private readonly telegramService: TelegramErrorService,
  ) {}

  async notifyError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      await this.telegramService.sendErrorNotification(
        error, 
        JSON.stringify(context, null, 2)
      );
    } catch(err) {
      console.log(err)
      throw err
    }
  }
}
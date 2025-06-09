// src/notifications/telegram.service.ts
import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramErrorService {
  private readonly logger = new Logger(TelegramErrorService.name);
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_ERROR_BOT_TOKEN, { polling: false });
  }

  async sendErrorNotification(error: Error, context?: string): Promise<void> {
    const chatId = process.env.TELEGRAM_CHAT_ID_ERROR_BOT;
    const message = `🚨 Error in app\n\n` +
                   `*Error*: ${error.name}\n` +
                   `*Message*: ${error.message}\n` +
                   `*Stack*: \`\`\`${error.stack}\`\`\`\n` +
                   (context ? `*Context*: ${context}` : '');

    try {
      await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      this.logger.error('Failed to send Telegram notification', err);
    }
  }
}
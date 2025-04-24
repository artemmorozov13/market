import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
  }

  async sendHtmlMessage(chatId: string, message: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }
}
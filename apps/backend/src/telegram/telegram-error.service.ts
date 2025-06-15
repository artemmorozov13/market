import { Injectable, Logger } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramErrorService {
  private readonly logger = new Logger(TelegramErrorService.name);
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_ERROR_BOT_TOKEN, { 
      polling: false 
    });
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&');
  }

  private prepareText(text: string | undefined, maxLength = 1500): string {
    if (!text) return 'N/A';
    const escaped = this.escapeMarkdown(text);
    return escaped.length > maxLength 
      ? escaped.substring(0, maxLength) + '...' 
      : escaped;
  }

  async sendErrorNotification(error: Error, context?: string): Promise<void> {
    const chatId = process.env.TELEGRAM_CHAT_ID_ERROR_BOT;
    
    if (!chatId || !this.bot) {
      this.logger.warn('Telegram bot not configured properly');
      return;
    }

    const message = [
      '🚨 *Error in app*',
      '',
      `*Error*: ${this.prepareText(error.name, 100)}`,
      `*Message*: ${this.prepareText(error.message, 500)}`,
      `*Stack*: \`\`\`${this.prepareText(error.stack)}\`\`\``,
      context ? `*Context*: ${this.prepareText(context, 300)}` : ''
    ].join('\n');

    try {
      await this.bot.sendMessage(chatId, message, { 
        parse_mode: 'MarkdownV2'
      });
    } catch (markdownError) {
      this.logger.error('Markdown send failed, trying plain text', markdownError);
      
      try {
        await this.bot.sendMessage(chatId, `Error: ${error.message}\n\nStack: ${error.stack?.substring(0, 1000)}`, {
          parse_mode: undefined
        });
      } catch (plainError) {
        this.logger.error('Failed to send plain text notification', plainError);
      }
    }
  }
}
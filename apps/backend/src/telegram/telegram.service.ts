import { UsersService } from '@app/users/users.service';
import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private bot: Telegraf;

  constructor(
    private readonly usersService: UsersService
  ) {
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

  async broadcastMessage(message: string) {
    const PAGE_SIZE = 100; // Количество пользователей за один запрос
    let skip = 0;
    let hasMoreUsers = true;

    // Отправляем сообщения с задержкой, чтобы избежать ограничений Telegram
    const BATCH_SIZE = 30; // 30 сообщений в секунду (лимит Telegram)
    const DELAY_MS = 1000; // 1 секунда между батчами

    while (hasMoreUsers) {
      // Получаем пользователей пачками
      const users = await this.usersService.getUsersDataList({
        limit: PAGE_SIZE,
        skip: skip
      });

      if (users.length === 0) {
        hasMoreUsers = false;
        break;
      }

      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(user => 
            this.sendHtmlMessage(user.telegram_id.toString(), message)
              .catch(e => console.error(`Error sending to user ${user.id}:`, e))
          )
        );
        
        if (i + BATCH_SIZE < users.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      skip += PAGE_SIZE;
    }
  }
}
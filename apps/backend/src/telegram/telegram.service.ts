import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@app/users/users.service';
import { StoreUserService } from '@app/store-user/store-user.service';
import { AuthJwtPayload } from '@core/types/user-type';
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf;
  private readonly BATCH_SIZE = 30;
  private readonly DELAY_MS = 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly storeUserService: StoreUserService,
  ) {
    this.initializeBot();
  }

  async sendMessageWithToken(botToken: string, chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<void> {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
      });
    } catch (error) {
      this.logger.error(`Failed to send message via bot token to ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async sendMessageToBotOwner(botToken: string, message: string): Promise<void> {
    try {
      // 1. Получаем информацию о боте
      const botInfo = await this.getBotInfo(botToken);
      
      // 2. Получаем updates бота (последние сообщения)
      const updates = await this.getBotUpdates(botToken);
      
      // 3. Находим чат с владельцем
      const ownerChatId = this.findOwnerChatId(updates, botInfo.id);
      
      if (!ownerChatId) {
        throw new Error('Не удалось определить chat_id для отправки сообщений');
      }
      
      // 4. Отправляем сообщение
      await this.sendMessageWithToken(botToken, ownerChatId, message);
    } catch (error) {
      this.logger.error(`Ошибка отправки сообщения через бота ${botToken}: ${error.message}`);
      throw error;
    }
  }

  private async getBotInfo(botToken: string): Promise<any> {
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
    return response.data.result;
  }

  private async getBotUpdates(botToken: string): Promise<any[]> {
    const response = await axios.get(`https://api.telegram.org/bot${botToken}/getUpdates?limit=10`);
    return response.data.result || [];
  }

  private findOwnerChatId(updates: any[], botId: number): string | null {
    // Ищем чат, где боту писали сообщения
    for (const update of updates) {
      if (update.message?.from?.id !== botId) {
        return update.message?.chat?.id?.toString() || null;
      }
    }
    return null;
  }

  private initializeBot() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN не настроен в переменных окружения');
    }

    this.bot = new Telegraf(token);
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.bot.catch((err) => {
      this.logger.error(`Telegram bot error: ${err}`);
    });
  }

  async sendMessage(chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: parseMode,
      });
      return true;
    } catch (error) {
      this.logger.warn(`Failed to send message to ${chatId}: ${error.message}`);
      
      // Обработка специфичных ошибок Telegram API
      if (error.description?.includes('chat not found')) {
        this.logger.warn(`Chat ${chatId} not found or bot was blocked`);
        return false;
      }
      
      throw error;
    }
  }

  async sendBatchMessages(messages: Array<{ chatId: string; message: string }>) {
    if (!messages?.length) {
      return {
        total: 0,
        success: 0,
        failed: 0,
        errors: [],
      };
    }

    const results = {
      total: messages.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ chatId: string; error: string }>,
    };

    for (let i = 0; i < messages.length; i += this.BATCH_SIZE) {
      const batch = messages.slice(i, i + this.BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async ({ chatId, message }) => {
          try {
            const success = await this.sendMessage(chatId, message);
            return { success, chatId };
          } catch (error) {
            return { success: false, chatId, error };
          }
        })
      );

      batchResults.forEach((result) => {
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            chatId: result.chatId,
            error: result.error?.message || 'Unknown error',
          });
        }
      });

      if (i + this.BATCH_SIZE < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, this.DELAY_MS));
      }
    }

    return results;
  }

  async broadcastMessage(userJwt: AuthJwtPayload, message: string) {
    const storeUser = await this.storeUserService.getStoreUserById(userJwt.id);
    if (!storeUser?.store?.id) {
      throw new Error('Store not found');
    }

    const PAGE_SIZE = 100;
    let skip = 0;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      const users = await this.usersService.getUsersDataList({
        limit: PAGE_SIZE,
        skip: skip,
      });

      if (!users?.length) {
        hasMoreUsers = false;
        break;
      }

      const messages = users
        .filter((user) => user.telegram_id)
        .map((user) => ({
          chatId: user.telegram_id.toString(),
          message: message,
        }));

      if (messages.length > 0) {
        await this.sendBatchMessages(messages);
      }

      skip += PAGE_SIZE;
    }
  }

  async onModuleDestroy() {
    await this.shutdownBot();
  }

  private async shutdownBot() {
    try {
      if (this.bot) {
        await this.bot.stop();
        this.logger.log('Telegram bot stopped gracefully');
      }
    } catch (error) {
      this.logger.error(`Failed to stop Telegram bot: ${error.message}`);
    }
  }
}
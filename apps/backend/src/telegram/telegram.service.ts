import { StoreService } from '@app/store/store.service';
import { UsersService } from '@app/users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { AuthJwtPayload } from '@core/types/user-type';
import { StoreUserService } from '@app/store-user/store-user.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly activeBots = new Map<number, Telegraf>();
  private readonly BATCH_SIZE = 30;
  private readonly DELAY_MS = 1000;
  private readonly TOKEN_CACHE_TTL = 300_000; // 5 минут кэширования токенов

  constructor(
    private readonly usersService: UsersService,
    private readonly storeService: StoreService,
    private readonly storeUserService: StoreUserService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private async getBotToken(storeId: number): Promise<string> {
    const cacheKey = `bot_token_${storeId}`;
    
    try {
      // Пытаемся получить токен из кэша
      const cachedToken = await this.cacheManager.get<string>(cacheKey);
      if (cachedToken) return cachedToken;

      // Если нет в кэше - запрашиваем из БД
      const token = await this.storeService.getStoreTelegramBotToken(storeId);
      if (!token) throw new Error(`Bot token not found for store ${storeId}`);

      // Сохраняем в кэш
      await this.cacheManager.set(cacheKey, token, this.TOKEN_CACHE_TTL);
      return token;
    } catch (error) {
      this.logger.error(`Failed to get bot token for store ${storeId}: ${error.message}`);
      throw error;
    }
  }

  private async getBotInstance(storeId: number): Promise<Telegraf> {
    // Если бот уже есть в памяти - возвращаем его
    if (this.activeBots.has(storeId)) {
      return this.activeBots.get(storeId);
    }

    // Создаем нового бота
    const token = await this.getBotToken(storeId);
    const bot = new Telegraf(token);
    
    // Сохраняем в активных ботах
    this.activeBots.set(storeId, bot);
    
    // Удаляем при ошибках
    bot.catch((err) => {
      this.logger.error(`Bot error for store ${storeId}: ${err}`);
      this.activeBots.delete(storeId);
    });

    return bot;
  }

  async sendHtmlMessage(storeId: number, chatId: string, message: string) {
    try {
      const bot = await this.getBotInstance(storeId);
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId} (store ${storeId}): ${error.message}`);
      throw error;
    }
  }

  async sendBatchMessages(storeId: number, messages: Array<{chatId: number, message: string}>) {
    if (!messages.length) return {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
    };

    const bot = await this.getBotInstance(storeId);
    const results = {
      total: messages.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{chatId: string, error: string}>,
    };

    for (let i = 0; i < messages.length; i += this.BATCH_SIZE) {
      const batch = messages.slice(i, i + this.BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(({chatId, message}) => 
          bot.telegram.sendMessage(chatId.toString(), message, {
            parse_mode: 'HTML',
          })
        )
      );

      batchResults.forEach((result, index) => {
        const {chatId} = batch[index];
        if (result.status === 'fulfilled') {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            chatId: chatId.toString(),
            error: result.reason.message,
          });
        }
      });

      if (i + this.BATCH_SIZE < messages.length) {
        await new Promise(resolve => setTimeout(resolve, this.DELAY_MS));
      }
    }

    return results;
  }

  async broadcastMessage(userJwt: AuthJwtPayload, message: string) {
    const storeUser = await this.storeUserService.getStoreUserById(userJwt.id);

    const PAGE_SIZE = 100;
    let skip = 0;
    let hasMoreUsers = true;

    while (hasMoreUsers) {
      const users = await this.usersService.getUsersDataList({
        limit: PAGE_SIZE,
        skip: skip
      });

      if (users.length === 0) {
        hasMoreUsers = false;
        break;
      }

      const messages = users.map(user => ({
        chatId: user.telegram_id,
        message: message
      }));

      await this.sendBatchMessages(storeUser.store.id, messages);
      skip += PAGE_SIZE;
    }
  }

  async cleanup() {
    for (const [storeId, bot] of this.activeBots) {
      try {
        await bot.stop();
        this.activeBots.delete(storeId);
      } catch (error) {
        this.logger.error(`Failed to cleanup bot for store ${storeId}: ${error.message}`);
      }
    }
  }
}
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { StoreService } from '@app/store/store.service';

@Injectable()
export class TelegramUtils {
  private readonly logger = new Logger(TelegramUtils.name);
  private readonly TOKEN_CACHE_TTL = 300_000;

  constructor(
    private readonly storeService: StoreService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private async getBotToken(storeId: number): Promise<string> {
    const cacheKey = `bot_token_${storeId}`;
    
    try {
      const cachedToken = await this.cacheManager.get<string>(cacheKey);
      if (cachedToken) return cachedToken;

      const token = await this.storeService.getStoreTelegramBotToken(storeId);
      if (!token) throw new Error(`Bot token not found for store ${storeId}`);

      await this.cacheManager.set(cacheKey, token, this.TOKEN_CACHE_TTL);
      return token;
    } catch (error) {
      this.logger.error(`Failed to get bot token: ${error.message}`);
      throw error;
    }
  }

  async validateInitData(storeId: number, initData: string): Promise<boolean> {
    if (!initData) {
      this.logger.error('initData is missing!');
      return false;
    }

    try {
      const botToken = await this.getBotToken(storeId);
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        this.logger.error('Hash not found in initData');
        return false;
      }

      const dataCheckString = Array.from(urlParams.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      if (!dataCheckString) {
        this.logger.error('No data to validate');
        return false;
      }

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const isValid = calculatedHash === hash;
      
      if (!isValid) {
        this.logger.warn(`Hash mismatch for store ${storeId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  async parseInitData(storeId: number, initData: string) {
    try {
      // Сначала валидируем данные
      const isValid = await this.validateInitData(storeId, initData);
      if (!isValid) {
        throw new Error('Invalid initData signature');
      }

      const urlParams = new URLSearchParams(initData);
      const userStr = urlParams.get('user');
      
      if (!userStr) throw new Error('User data not found');

      const userData = JSON.parse(decodeURIComponent(userStr));
      
      if (!userData?.id) {
        throw new Error('Invalid user data: missing ID');
      }

      return {
        id: userData.id,
        first_name: userData.first_name,
        username: userData.username,
        storeId, // Добавляем ID магазина к результату
      };
    } catch (error) {
      this.logger.error(`Parse error: ${error.message}`);
      throw error;
    }
  }
}
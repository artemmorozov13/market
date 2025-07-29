import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { URLSearchParams } from 'url';
import { TelegramAuthData } from '@app/telegram/types/telegram-user-types';

@Injectable()
export class TelegramUtils {
  private readonly logger = new Logger(TelegramUtils.name);
  private readonly botToken: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    }
  }

  /**
   * Валидация сырой строки initData от Telegram WebApp
   * @param initDataStr Строка в формате "key=value&key2=value2..."
   */
  async validateInitDataString(initDataStr: string): Promise<boolean> {
    try {
      const urlParams = new URLSearchParams(initDataStr);
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

      return this.validateHash(dataCheckString, hash);
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Валидация уже распарсенного объекта с данными Telegram
   * @param authData Объект TelegramAuthData
   */
  async validateInitDataObject(authData: TelegramAuthData): Promise<boolean> {
    try {
      if (!authData.hash) {
        this.logger.error('Hash not found in authData');
        return false;
      }

      const urlParams = new URLSearchParams();
      urlParams.append('id', authData.id.toString());
      urlParams.append('first_name', authData.first_name);
      if (authData.last_name) urlParams.append('last_name', authData.last_name);
      if (authData.username) urlParams.append('username', authData.username);
      if (authData.photo_url) urlParams.append('photo_url', authData.photo_url);
      urlParams.append('auth_date', authData.auth_date.toString());

      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      return this.validateHash(dataCheckString, authData.hash);
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Общая логика проверки хеша (вынесена в отдельный метод)
   * @param dataCheckString Строка для проверки
   * @param hash Оригинальный хеш из данных
   */
  private validateHash(dataCheckString: string, hash: string): boolean {
    if (!dataCheckString) {
      this.logger.error('No data to validate');
      return false;
    }

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;
    
    if (!isValid) {
      this.logger.warn('Hash mismatch in validation');
    }

    return isValid;
  }
}
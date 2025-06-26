import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

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

  async validateInitData(initData: string): Promise<boolean> {
    try {
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
        .update(this.botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const isValid = calculatedHash === hash;
      
      if (!isValid) {
        this.logger.warn('Hash mismatch in initData validation');
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Validation error: ${error.message}`);
      return false;
    }
  }

  async parseInitData(initData: string) {
    try {
      const isValid = await this.validateInitData(initData);
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
      };
    } catch (error) {
      this.logger.error(`Parse error: ${error.message}`);
      throw error;
    }
  }
}
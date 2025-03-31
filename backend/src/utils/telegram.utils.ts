// src/utils/telegram.utils.ts
import * as crypto from 'crypto';
import fetch from 'node-fetch';

export class TelegramUtils {
  private static BOT_TOKEN = 'YOUR_BOT_TOKEN'; // Замените на токен вашего бота

  /**
   * Проверяет данные initData от Telegram.
   * @param initData Строка initData, которую отправляет Telegram WebApp.
   * @returns Возвращает true, если данные валидны, иначе false.
   */
  static async validateInitData(initData: string): Promise<boolean> {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    const dataToCheck = Array.from(urlParams.entries())
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataToCheck)
      .digest('hex');

    return calculatedHash === hash;
  }

  /**
   * Получает данные пользователя из initData.
   * @param initData Строка initData, которую отправляет Telegram WebApp.
   * @returns Возвращает объект с данными пользователя.
   */
  static parseInitData(initData: string): { id: number; first_name: string; username?: string } {
    const urlParams = new URLSearchParams(initData);
    const userData = JSON.parse(urlParams.get('user') || '{}');

    return {
      id: userData.id,
      first_name: userData.first_name,
      username: userData.username,
    };
  }
}
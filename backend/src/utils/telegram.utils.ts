import * as crypto from 'crypto';

export class TelegramUtils {
  private static BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  /**
   * Проверяет данные initData от Telegram.
   * @param initData Строка initData, которую отправляет Telegram WebApp.
   * @returns Возвращает true, если данные валидны, иначе false.
   */
  static validateInitData(initData: string): boolean {
    console.log(process.env.TELEGRAM_BOT_TOKEN)
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      if (!hash) return false;

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
    } catch (error) {
      console.error('Error validating initData:', error);
      return false;
    }
  }

  /**
   * Получает данные пользователя из initData.
   * @param initData Строка initData, которую отправляет Telegram WebApp.
   * @returns Возвращает объект с данными пользователя.
   * @throws Если данные невалидны или отсутствуют.
   */
  static parseInitData(initData: string): { id: number; first_name: string; username?: string } {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      throw new Error('User data not found in initData');
    }

    try {
      const userData = JSON.parse(userStr);
      
      if (!userData?.id) {
        throw new Error('Invalid user data format');
      }

      return {
        id: userData.id,
        first_name: userData.first_name,
        username: userData.username,
      };
    } catch (error) {
      throw new Error(`Failed to parse user data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
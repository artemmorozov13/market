import * as crypto from 'crypto';

export class TelegramUtils {
  private static BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  static validateInitData(initData: string): boolean {
    if (!initData || !this.BOT_TOKEN) {
      console.error('initData or BOT_TOKEN is missing!');
      return false;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      if (!hash) {
        console.error('Hash not found in initData');
        return false;
      }

      // Собираем все параметры, кроме `hash`, сортируем и объединяем
      const dataCheckString = Array.from(urlParams.entries())
        .filter(([key]) => key !== 'hash')
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      if (!dataCheckString) {
        console.error('No data to validate (empty after filtering)');
        return false;
      }

      // Генерируем секретный ключ
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.BOT_TOKEN)
        .digest();

      // Вычисляем хеш
      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const isValid = calculatedHash === hash;
      
      if (!isValid) {
        console.error('Hash mismatch!');
      }

      return isValid;
    } catch (error) {
      console.error('Error validating initData:', error);
      return false;
    }
  }

  static parseInitData(initData: string) {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) throw new Error('User data not found in initData');

    try {
      // Декодируем `user` (он приходит в URL-encoded формате)
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
      throw new Error(`Failed to parse user data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
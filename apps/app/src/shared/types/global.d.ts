// Определяем тип для Telegram WebApp
interface TelegramWebApp {
  initData: string
  // Другие свойства, которые вы используете
  // Например:
  // initDataUnsafe: any;
  // version: string;
}

// Расширяем интерфейс Window
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Экспортируем типы для использования в компонентах
export type { TelegramWebApp }

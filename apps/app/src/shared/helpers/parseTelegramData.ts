import { TelegramAuthData } from "@telegram-auth/react";

export const parseTelegramData = (initData: string): TelegramAuthData => {
  const decodedString = decodeURIComponent(initData);
  const params = new URLSearchParams(decodedString);
  
  const result: Record<string, any> = {};
  
  Array.from(params.entries()).forEach(([key, value]) => {
    try {
      result[key] = JSON.parse(value);
    } catch (e) {
      result[key] = value;
    }
  });
  
  return result as TelegramAuthData;
};
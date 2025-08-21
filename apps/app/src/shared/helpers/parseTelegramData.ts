import { TelegramAuthData } from '@telegram-auth/react'

export const parseTelegramData = (initData: string): TelegramAuthData => {
  const decodedString = decodeURIComponent(initData)
  const params = new URLSearchParams(decodedString)

  const rawData: any = {}

  Array.from(params.entries()).forEach(([key, value]) => {
    try {
      rawData[key] = JSON.parse(value)
    } catch (e) {
      rawData[key] = value
    }
  })

  const result: Partial<TelegramAuthData> = {
    id: rawData.user?.id,
    first_name: rawData.user?.first_name,
    last_name: rawData.user?.last_name || undefined,
    username: rawData.user?.username || undefined,
    photo_url: rawData.user?.photo_url || undefined,
    auth_date: rawData.auth_date ? parseInt(rawData.auth_date) : 0,
    hash: rawData.hash || '',
  }

  return result as TelegramAuthData
}

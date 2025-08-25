export interface StoreEditFormType {
  id: number
  name: string
  description: string
  isDeliveryFree: boolean
  minOrderBeforeDeliveryHours: number
  deliveryCost: number
  deliveryFreeFromLimit: number
  imageUrl: string | null
  telegramBotToken: string
  helpTelegramAccount: string | null
  logoUrl: string
  timezone: string
  isWeekLimited: boolean
  isWorkWithPartners: boolean
}

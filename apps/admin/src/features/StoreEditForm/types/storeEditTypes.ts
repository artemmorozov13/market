export interface StoreEditFormType {
    id: number,
    name: string,
    description: string,
    isDeliveryFree: boolean,
    minOrderBeforeDeliveryHours: number;
    deliveryCost: number,
    deliveryFreeFromLimit: number,
    telegramBotToken: string,
    logoUrl: string
    timezone: string
    isWeekLimited: boolean
}
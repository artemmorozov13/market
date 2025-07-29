import { UploaderReturnType } from "@core/types/uploader-type";

export interface StoreEditFormType {
    id: number,
    name: string,
    description: string,
    isDeliveryFree: boolean,
    minOrderBeforeDeliveryHours: number;
    deliveryCost: number,
    deliveryFreeFromLimit: number,
    imageUrl: string | null
    telegramBotToken: string,
    logoUrl: string
    timezone: string
    isWeekLimited: boolean
}
import { ProductType } from "./product-item";

export interface StoreBaseType {
    id: number
    name: string
    description: string
    isDeliveryFree: boolean
    deliveryCost: number;
    deliveryFreeFromLimit: number
    telegramBotToken: string;
    logoUrl: string;
    isWeekLimited: boolean,
    timezone: string;
    minOrderBeforeDeliveryHours: number
    products: ProductType[]
    // staff: 
}

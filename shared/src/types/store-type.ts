export interface StoreBaseType {
    id: number
    name: string
    description: string
    isDeliveryFree: boolean
    deliveryCost: number;
    deliveryFreeFromLimit: number
    telegramBotToken: string;
    logoUrl: string;
    // staff: 
}

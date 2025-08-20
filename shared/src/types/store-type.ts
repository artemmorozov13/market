import { DeliveryAreaBase } from "./delivery-area-type";
import { StoreDeliveryStrategies } from "./delivery-strategies-type";
import { PickupPointType } from "./pickup-point-type";
import { ProductType } from "./product-item";

export interface StoreBaseType {
    id: number
    name: string
    description: string
    isDeliveryFree: boolean
    isWorkWithPartners: boolean
    deliveryCost: number;
    deliveryFreeFromLimit: number
    telegramBotToken: string;
    imageUrl: string;
    isWeekLimited: boolean,
    helpTelegramAccount: string
    timezone: string;
    minOrderBeforeDeliveryHours: number
    products: ProductType[]
    pickupPoints: PickupPointType[],
    deliveryAreas: DeliveryAreaBase[],
    deliveryStrategies: StoreDeliveryStrategies
}

import { ProductType } from "@core/types/product-item";
import { StoreBaseType } from "@core/types/store-type";

export interface OrderedProduct {
    id: number;
    telegram_id: string;
    quantity: number;
    product: ProductType;
}
  
export interface PickupPoint {
    id: number;
    name: string;
    fullAddress: string;
    postal_code: string;
    fias_id: string;
    geo_lat: string;
    geo_lon: string;
    status: string;
}
  
export interface Order {
    id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    deliveryDate: string;
    address: string;
    fullAddress: string;
    phoneNumber: string;
    comment: string;
    totalAmount: string;
    paymentMethod: string | null;
    cancelReason?: string
    ordered_products: OrderedProduct[];
    deliveryTime: {
        id: number,
        dayOfWeek: string,
        startTime: string,
        endTime: string,
        isActive: boolean,
        createdAt: Date,
        updatedAt: Date
    };
    store?: StoreBaseType
    pickupPoint: PickupPoint;
}
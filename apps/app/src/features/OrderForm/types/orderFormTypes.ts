import { AddressType } from "@/entities/Addresses";
import { StoreBaseType } from "@core/types/store-type";

export interface DeliveryArea {
    id: number;
    name: string;
    radius: number
    fullAddress?: string;
    fias_id: string;
    geo_lat: string;
    status: 'active';
    geo_lon: string;
    postal_code: string
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deliveryTimes: DeliveryTime[];
}

export interface DeliveryTime {
  id: number;
  dayOfWeek: string; // Добавлено поле дня недели
  startTime: string;
  endTime: string;  
  deliveryAreaId: number;
}

export interface OrderFormInputs {
  address: AddressType | null;
  phone: string;
  addressId: string | null;
  storeId: number| null
  comment: string;
  deliveryAreaId: number | null;
  deliveryTimeId: number | null;
  deliveryDate: string | null;
  timezone: string;
  isWeekLimited: boolean;
}
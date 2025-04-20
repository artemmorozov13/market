export interface DeliveryTime {
    id?: number;
    dayOfWeek: DayOption;
    startTime: TimeOption;
    endTime: TimeOption;
  }
  
export interface PickupPoint {
    id: number;
    name: string;
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

export interface DeliveryTimeForm {
  dayOfWeek: DayOption;
  startTime: TimeOption;
  endTime: TimeOption;
}

export interface PickupPointFormData {
  id?: number;
  name: string;
  address: string;
  postal_code: string;
  fias_id: string;
  geo_lat: string;
  geo_lon: string;
  status: 'active' | 'deleted';
  deliveryTimes: DeliveryTimeForm[];
}
  
export interface TimeOption {
    value: string;
    label: string;
}
  
export interface DayOption {
    value: string;
    label: string;
}
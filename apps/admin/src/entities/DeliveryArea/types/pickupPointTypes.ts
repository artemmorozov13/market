export interface DeliveryTime {
    id?: number;
    dayOfWeek: DayOption;
    startTime: TimeOption;
    endTime: TimeOption;
}
  
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

export interface DeliveryTimeResponse {
    id: number,
    dayOfWeek: string,
    startTime: string,
    endTime: string,
    isActive: boolean,
    createdAt: string
    updatedAt: string
}

export interface DeliveryAreaResponse {
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
    deliveryTimes: DeliveryTimeResponse[];
}

export interface TimeOption {
    value: string;
    label: string;
}
  
export interface DayOption {
    value: string;
    label: string;
}

export interface DeliveryTimeForm {
    dayOfWeek: DayOption;
    startTime: TimeOption;
    endTime: TimeOption;
  }
  
export interface DeliveryAreaForm {
    id?: number;
    name: string;
    radius: number
    address: string;
    postal_code: string;
    fias_id: string;
    geo_lat: string;
    geo_lon: string;
    status: 'active' | 'deleted';
    deliveryTimes: DeliveryTimeForm[];
}

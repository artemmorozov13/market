export interface DeliveryTime {
    id?: number;
    dayOfWeek: DayOption;
    startTime: TimeOption;
    endTime: TimeOption;
  }
  
export interface PickupPoint {
    id: number;
    name: string;
    address?: string;
    coordinates?: string;
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
export interface DeliveryTime {
    id?: number;
    startTime: {
      value: string;
      label: string;
    };
    endTime: {
      value: string;
      label: string;
    };
  }
  
  export interface PickupPoint {
    id: number;
    name: string;
    deliveryTimes: DeliveryTime[];
  }
  
  export interface PickupPointFormData {
    id?: number;
    name: string;
    deliveryTimes: DeliveryTime[];
  }
  
  export type TimeOption = {
    value: string;
    label: string;
  };
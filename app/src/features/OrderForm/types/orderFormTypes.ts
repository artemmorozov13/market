export interface PickupPoint {
    id: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
    deliveryTimes: DeliveryTime[];
  }
  
  // types/deliveryTime.ts
  export interface DeliveryTime {
    id: number;
    startTime: string;
    endTime: string;  
    pickupPointId: number;
  }

export interface OrderFormInputs {
    street: string
    house: string
    entrance: string
    floor: string
    apartment: string
    address: string;
    phone: string;
    comment?: string;
    pickupPointId: number | null;
    deliveryTimeId: number | null;
  }
  
export interface PickupPointWithTimes extends PickupPoint {
    deliveryTimes: DeliveryTime[];
}

export interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
  }
  
  export interface PickupPointsResponse {
    pickupPoints: PickupPoint[];
  }
  
  export interface DeliveryTimesResponse {
    deliveryTimes: DeliveryTime[];
  }

  
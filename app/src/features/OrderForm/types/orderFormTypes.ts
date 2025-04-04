export interface PickupPoint {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  deliveryTimes: DeliveryTime[];
}

export interface DeliveryTime {
  id: number;
  dayOfWeek: string; // Добавлено поле дня недели
  startTime: string;
  endTime: string;  
  pickupPointId: number;
}

export interface OrderFormInputs {
  address: string;
  phone: string;
  comment: string;
  pickupPointId: number | null;
  deliveryTimeId: number | null;
  deliveryDate: string | null;
}
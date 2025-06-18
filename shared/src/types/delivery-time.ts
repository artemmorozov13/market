export interface DeliveryTimeIntervalBase {
  id: number;
  dayOfWeek: string; // 'monday', 'tuesday' и т.д.
  startTime: string; // в формате 'HH:MM:SS'
  endTime: string;   // в формате 'HH:MM:SS'
  isActive: boolean;
  pickupPointId?: number;
}

// Ответ от API с группировкой по датам
export interface DeliveryTimeBase {
  date: string;       // Дата в формате 'YYYY-MM-DD'
  dayOfWeek: string;  // День недели ('monday', 'tuesday' и т.д.)
  times: DeliveryTimeIntervalBase[]; // Доступные интервалы времени
}
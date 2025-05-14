import { DeliveryTime } from "@/features/OrderForm/types/orderFormTypes";

export const groupDeliveryTimesByDay = (
    deliveryTimes: DeliveryTime[],
    weekDates: Record<string, { date: Date; formattedDate: string }>
  ) => {
    return deliveryTimes
      .filter(time => weekDates[time.dayOfWeek] !== undefined)
      .reduce((acc, time) => {
        const day = time.dayOfWeek;
        if (!acc[day]) acc[day] = [];
        acc[day].push(time);
        return acc;
      }, {} as Record<string, DeliveryTime[]>);
};
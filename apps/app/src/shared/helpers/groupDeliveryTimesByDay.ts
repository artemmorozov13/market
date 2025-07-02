import { DeliveryTimeBase } from "@core/types/delivery-time";

export const groupDeliveryTimesByDay = (
    deliveryTimes: DeliveryTimeBase[],
    weekDates: Record<string, { date: Date; formattedDate: string }>
  ) => {
    return deliveryTimes
      .filter(time => weekDates[time.dayOfWeek] !== undefined)
      .reduce((acc, time) => {
        const day = time.dayOfWeek;
        if (!acc[day]) acc[day] = [];
        acc[day].push(time);
        return acc;
      }, {} as Record<string, DeliveryTimeBase[]>);
};
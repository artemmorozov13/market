export const getAvailableDeliveryDates = (
    deliveryDays: number[],
    currentDate: Date = new Date()
  ): Date[] => {
    const result: Date[] = [];
    const now = new Date(currentDate);
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();
    const currentTime = now.getTime();
  
    for (let i = 1; i <= 7; i++) {
      if (i <= currentDay) continue;
      if (i === 1) continue;
  
      if (deliveryDays.includes(i)) {
        const targetDate = new Date(now);
        const daysToAdd = i - currentDay;
        targetDate.setDate(now.getDate() + daysToAdd);
        targetDate.setHours(0, 0, 0, 0);
  
        if (targetDate.getTime() - currentTime >= 1 * 60 * 60 * 1000) {
          result.push(targetDate);
        }
      }
    }
  
    return result;
};
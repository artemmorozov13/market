import { DeliveryTime } from '../entities/delivery-time.entity';

export class DeliveryService {
  /**
   * Вычисляет ближайшую дату доставки для указанного времени доставки
   * @param deliveryTime Время доставки из базы данных
   * @param referenceDate Опциональная дата, от которой ведём расчёт (по умолчанию текущая дата)
   */
  calculateNextDeliveryDate(deliveryTime: DeliveryTime, referenceDate: Date = new Date()): Date {
    const dayOfWeekMap = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0
    };

    const targetDay = dayOfWeekMap[deliveryTime.dayOfWeek];
    const currentDay = referenceDate.getDay();
    const date = new Date(referenceDate);
    
    // Вычисляем разницу дней до следующего targetDay
    let daysToAdd = (targetDay - currentDay + 7) % 7;
    // Если сегодня нужный день, проверяем время
    if (daysToAdd === 0) {
      const [hours, minutes] = deliveryTime.startTime.split(':').map(Number);
      const deliveryDateTime = new Date(date);
      deliveryDateTime.setHours(hours, minutes, 0, 0);
      
      // Если время уже прошло сегодня, берём следующий week
      if (deliveryDateTime < referenceDate) {
        daysToAdd = 7;
      }
    }

    date.setDate(date.getDate() + daysToAdd);
    return date;
  }
}
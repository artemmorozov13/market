import { setSeederFactory } from "typeorm-extension";
import { DeliveryTime } from "../entities/delivery-time.entity";
import { customFaker } from "./main.factory";


export const DeliveryTimeFactory = setSeederFactory(DeliveryTime, () => {
    const deliveryTime = new DeliveryTime();

    
    
    // Выбираем случайный день недели
    deliveryTime.dayOfWeek = customFaker.helpers.arrayElement([
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ] as any);
    
    // Генерируем временные интервалы (каждые 2 часа)
    const startHour = customFaker.helpers.arrayElement([8, 10, 12, 14, 16, 18]);
    deliveryTime.startTime = `${startHour}:00`;
    deliveryTime.endTime = `${startHour + 2}:00`;
    
    deliveryTime.isActive = true
    
    return deliveryTime;
});
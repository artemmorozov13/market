import { setSeederFactory } from "typeorm-extension";
import { PickupWorkingHoursEntity } from "../entities/pickup-working-hours.entity";
import { customFaker } from "./main.factory";


export const PickupWorkingHoursFactory = setSeederFactory(PickupWorkingHoursEntity, () => {
    const workingHours = new PickupWorkingHoursEntity();

    
    
    workingHours.dayOfWeek = customFaker.helpers.arrayElement([
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ] as any);
    
    // Генерируем рабочие часы (обычно 8-12 часов работы)
    const openingHour = customFaker.number.int({ min: 8, max: 10 });
    const closingHour = openingHour + customFaker.number.int({ min: 8, max: 12 });
    
    workingHours.openingTime = `${openingHour}:00`;
    workingHours.closingTime = `${closingHour}:00`;
    
    return workingHours;
});
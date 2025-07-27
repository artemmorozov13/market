import { setSeederFactory } from "typeorm-extension";
import { DeliveryStrategy } from "../entities/delivery-strategy.entity";
import { DeliveryStrategyEnum } from "../enums/delivery-strategy.enum";
import { customFaker } from "./main.factory";

export const DeliveryStrategyFactory = setSeederFactory(DeliveryStrategy, () => {
    const strategy = new DeliveryStrategy();
    
    // Для первой стратегии
    if (customFaker.datatype.boolean()) {
        strategy.type = DeliveryStrategyEnum.DeliveryToEntrance;
        strategy.title = "Доставка до подъезда";
    } 
    // Для второй стратегии
    else {
        strategy.type = DeliveryStrategyEnum.PickupByYourself;
        strategy.title = "Самовывоз";
    }
    
    return strategy;
});
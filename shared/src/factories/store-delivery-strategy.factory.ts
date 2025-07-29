import { setSeederFactory } from "typeorm-extension";
import { StoreDeliveryStrategy } from "../entities/store-delivery-strategy.entity";

export const StoreDeliveryStrategyFactory = setSeederFactory(StoreDeliveryStrategy, () => {
    const storeStrategy = new StoreDeliveryStrategy();
    
    return storeStrategy;
});
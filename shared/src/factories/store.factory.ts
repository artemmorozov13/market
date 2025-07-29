import { setSeederFactory } from "typeorm-extension";
import { StoreEntity } from "../entities/store.entity";
import { customFaker } from "./main.factory";


export const StoreFactory = setSeederFactory(StoreEntity, () => {
    const store = new StoreEntity();

    store.name = customFaker.company.name();
    store.description = customFaker.datatype.boolean(0.7) ? 'Описание магазина' : null;
    store.isDeliveryFree = customFaker.datatype.boolean();
    store.deliveryCost = store.isDeliveryFree ? 0 : customFaker.number.float({ min: 100, max: 500 });
    store.deliveryFreeFromLimit = store.isDeliveryFree ? 0 : customFaker.number.float({ min: 1000, max: 5000 });
    store.telegramBotToken = customFaker.datatype.boolean(0.3) ? customFaker.string.alphanumeric(32) : null;
    store.logoUrl = customFaker.datatype.boolean(0.5) ? customFaker.image.url() : null;
    store.isWeekLimited = customFaker.datatype.boolean();
    store.minOrderBeforeDeliveryHours = customFaker.number.int({ min: 0, max: 48 });
    store.timezone = 'Europe/Moscow';
    store.imageUrl = customFaker.datatype.boolean(0.4) ? customFaker.image.url() : null;
    
    return store;
});
import { faker } from "@faker-js/faker";
import { BasketEntity } from "../entities/basket.entity";
import { setSeederFactory } from "typeorm-extension";

export const BasketFactory = setSeederFactory(BasketEntity, () => {
    const basket = new BasketEntity();
    basket.products_count = faker.number.int({ min: 0, max: 10 });
    return basket;
});

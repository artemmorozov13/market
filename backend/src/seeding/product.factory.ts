import { ProductEntity } from "../entities/product.entity";
import { setSeederFactory } from "typeorm-extension";
import { faker } from "@faker-js/faker";

export const ProductFactory = setSeederFactory(ProductEntity, () => {
    const product = new ProductEntity();

    product.name = faker.commerce.productName();
    product.description = faker.commerce.productDescription();
    product.price = parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 }));
    product.discount = parseFloat(faker.number.float({ min: 0, max: 1 }).toFixed(2));
    product.image = faker.image.url();
    product.unitOfMeasurement = faker.helpers.arrayElement(["гр", "кг"]);
    product.createdAt = faker.date.past();
    product.updatedAt = new Date();

    return product;
});

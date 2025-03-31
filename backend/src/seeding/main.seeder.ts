import { faker } from "@faker-js/faker";
import { BasketEntity } from "../entities/basket.entity";
import { OrderEntity } from "../entities/order.entity";
import { ProductEntity } from "../entities/product.entity";
import { UsersEntity } from "../entities/users.entity";
// import { AddressEntity } from "../entities/address.entity";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

export class MainSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
        const userRepo = dataSource.getRepository(UsersEntity);
        const basketRepo = dataSource.getRepository(BasketEntity);
        // const addressRepo = dataSource.getRepository(AddressEntity);
        const productRepo = dataSource.getRepository(ProductEntity);
        const orderRepo = dataSource.getRepository(OrderEntity);

        console.log("Seeding users...");
        const userFactory = factoryManager.get(UsersEntity);
        const basketFactory = factoryManager.get(BasketEntity);

        const fakeData = await Promise.all(
            Array.from({ length: 10 }, async () => {
                const basket = await basketFactory.save({ products_count: 0 });

                const user = await userFactory.save({
                    basket,
                });
                basket.user = user;

                // const addresses = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => {
                //     const address = new AddressEntity();
                //     address.addressString = faker.location.streetAddress();
                //     address.user = user;
                //     return address;
                // });

                // await addressRepo.save(addresses);

                return [user, basket];
            })
        );

        const [users, baskets] = fakeData.reduce(
            ([userArr, basketArr], [user, basket]) => {
                userArr.push(user as UsersEntity);
                basketArr.push(basket as BasketEntity);
                return [userArr, basketArr];
            },
            [[], []] as [UsersEntity[], BasketEntity[]]
        );

        await userRepo.save(users);
        await basketRepo.save(baskets);

        console.log("Seeding products...");
        const productsFactory = factoryManager.get(ProductEntity);
        const products = await Promise.all(
            Array.from({ length: 25 }).map(async () => {
                const product = await productsFactory.save();
                return product;
            })
        );
        await productRepo.save(products);

        console.log("Seeding orders...");
        const orderFactory = factoryManager.get(OrderEntity);
        const orders = await Promise.all(
            Array.from({ length: 10 }).map(async () => {
                const order = await orderFactory.save({
                    user: faker.helpers.arrayElement(users),
                });
                return order;
            })
        );
        await orderRepo.save(orders);

        console.log("Seeding order_products...");
        // for (const order of orders) {
        //     // Связываем заказ с несколькими случайными продуктами
        //     const randomProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 5 }));
        //     order.products = randomProducts;
        //     await orderRepo.save(order);
        // }
    }
}
import { registerAs } from "@nestjs/config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { AddressesEntity, BasketEntity, DeliveryArea, DeliveryStrategy, DeliveryTime, OrderedProductsEntity, OrderEntity, PickupPointEntity, PickupWorkingHoursEntity, ProductEntity, SelectedProductEntity, StoreDeliveryStrategy, StoreEntity, StoreUserEntity, UsersEntity } from "@core/entities";

export default registerAs('database', (): PostgresConnectionOptions => {
    return ({
        port: Number(process.env.DB_PORT),
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        entities: [
             AddressesEntity,
             BasketEntity,
             DeliveryTime,
             OrderEntity,
             OrderedProductsEntity,
             DeliveryArea,
             ProductEntity,
             SelectedProductEntity,
             UsersEntity,
             StoreUserEntity,
             StoreEntity,
             DeliveryStrategy,
             StoreDeliveryStrategy,
             PickupPointEntity,
             PickupWorkingHoursEntity
        ],
        migrationsTableName: 'migrations',
    })
})
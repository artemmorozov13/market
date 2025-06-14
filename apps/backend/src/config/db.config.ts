import { AddressesEntity } from "@core/entities/addresses.entity";
import { BasketEntity } from "@core/entities/basket.entity";
import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { PickupPoint } from "@core/entities/pickup-point.entity";
import { ProductEntity } from "@core/entities/product.entity";
import { SelectedProductEntity } from "@core/entities/selected-product.entity";
import { StoreUserEntity } from "@core/entities/store-user.entity";
import { StoreEntity } from "@core/entities/store.entity";
import { UsersEntity } from "@core/entities/users.entity";
import { registerAs } from "@nestjs/config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

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
             PickupPoint,
             ProductEntity,
             SelectedProductEntity,
             UsersEntity,
             StoreUserEntity,
             StoreEntity
        ],
        migrationsTableName: 'migrations',
    })
})
import { AddressesEntity } from "@core/entities/addresses.entity";
import { BasketEntity } from "@core/entities/basket.entity";
import { DeliveryStrategy } from "@core/entities/delivery-strategy.entity";
import { DeliveryTime } from "@core/entities/delivery-time.entity";
import { OrderEntity } from "@core/entities/order.entity";
import { OrderedProductsEntity } from "@core/entities/ordered-products.entity";
import { DeliveryArea } from "@core/entities/delivery-area.entity";
import { ProductEntity } from "@core/entities/product.entity";
import { SelectedProductEntity } from "@core/entities/selected-product.entity";
import { StoreDeliveryStrategy } from "@core/entities/store-delivery-strategy.entity";
import { StoreUserEntity } from "@core/entities/store-user.entity";
import { StoreEntity } from "@core/entities/store.entity";
import { UsersEntity } from "@core/entities/users.entity";
import { registerAs } from "@nestjs/config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { PickupPointEntity } from "@core/entities/pickup-point.entity";
import { PickupWorkingHoursEntity } from "@core/entities/pickup-working-hours.entity";

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
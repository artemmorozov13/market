import { DataSource, DataSourceOptions } from "typeorm";
import {
    AddressFactory,
    AppSeederOptions,
    DeliveryAreaFactory,
    DeliveryStrategyFactory,
    DeliveryTimeFactory,
    MainFactory,
    PickupPointFactory,
    PickupWorkingHoursFactory,
    ProductFactory,
    runAppSeeders,
    StoreDeliveryStrategyFactory,
    StoreFactory,
    StoreUserFactory,
    UserFactory
} from "@core/factories";
import * as entities from '@core/entities'
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '../../.env' });

export const options: DataSourceOptions & AppSeederOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: Object.values(entities),
    synchronize: true,
    logging: true,
    factories: [
        AddressFactory,
        DeliveryAreaFactory,
        DeliveryStrategyFactory,
        DeliveryTimeFactory,
        PickupPointFactory,
        PickupWorkingHoursFactory,
        ProductFactory,
        StoreDeliveryStrategyFactory,
        StoreUserFactory,
        StoreFactory,
        UserFactory,
    ],
    seeds: [
        MainFactory
    ]
}

export const datasource = new DataSource(options)

datasource.initialize().then(async () => {
    await datasource.synchronize(true)
    await runAppSeeders(datasource as any)
    process.exit()
})

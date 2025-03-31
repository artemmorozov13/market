import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions, runSeeders } from "typeorm-extension";
import { ProductFactory } from "./product.factory";
import { UserFactory } from "./user.factory";
import { OrderFactory } from "./order.factory";
import { MainSeeder } from "./main.seeder";
import { BasketFactory } from "./basket.factory";
// import { AddressFactory } from "./address.factory";
// import dbConfig from "../config/db.config";

// const options: DataSourceOptions & SeederOptions = {
//     ...dbConfig(),
//     factories: [ProductFactory, UserFactory, BasketFactory, OrderFactory],
//     seeds: [MainSeeder]
// }

// const dataSource = new DataSource(options)
// dataSource.initialize().then(async () => {
//     await dataSource.synchronize(true)
//     await runSeeders(dataSource)
//     process.exit()
// })

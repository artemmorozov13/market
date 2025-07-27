import { DataSource, DataSourceOptions } from "typeorm";
import path, { resolve } from "path";
import * as entities from "@core/entities";
import { config } from "dotenv";

config({ path: path.resolve(__dirname, '../../../../.env.dev') });

export const typeOrmConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: Object.values(entities),
    migrations: [path.join(__dirname, '../../migrations/*.ts')],
    synchronize: true,
}

export default new DataSource(typeOrmConfig);

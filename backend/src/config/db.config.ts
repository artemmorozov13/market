// import { AddressEntity } from "src/entities/address.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

export default (): PostgresConnectionOptions => {
    return ({
        port: Number(process.env.DB_PORT),
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    })
}
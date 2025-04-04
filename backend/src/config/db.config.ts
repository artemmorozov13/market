// import { AddressEntity } from "src/entities/address.entity";
import { ConfigService, registerAs } from "@nestjs/config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";


export default registerAs('database', (): PostgresConnectionOptions => {
    return ({
        port: Number(process.env.DB_PORT),
        type: "postgres",
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: false,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [`${__dirname}/../../db/migrations/*{.ts,.tsx}`],
        migrationsTableName: 'migrations'
    })
})
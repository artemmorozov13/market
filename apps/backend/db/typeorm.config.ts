import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

const configService = new ConfigService()

export default new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [],
    migrationsTableName: 'migrations',
    synchronize: true
})
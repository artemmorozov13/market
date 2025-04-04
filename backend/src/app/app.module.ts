import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PickupPointModule } from 'src/pickup-point/pickup-point.module';
import { DatabaseConfig } from 'src/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [DatabaseConfig]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database')
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    RolesModule,
    ProductModule,
    OrderModule,
    FileUploaderModule,
    AuthModule,
    PickupPointModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/users.module';
import { RolesModule } from 'src/roles/roles.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { PickupPointModule } from 'src/pickup-point/pickup-point.module';
import dbConfig from 'src/config/db.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [dbConfig]
    }),
    TypeOrmModule.forRootAsync({
      useFactory: dbConfig
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

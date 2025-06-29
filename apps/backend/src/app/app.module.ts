import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { FileUploaderModule } from 'src/file-uploader/file-uploader.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { DeliveryAreaModule } from '@app/delivery-area/delivery-area.module';
import { DatabaseConfig } from 'src/config';
import { DadataModule } from 'src/dadata/dadata.module';
import { AddressesModule } from 'src/addresses/addresses.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';
import { StatisticModule } from 'src/statistic/statistic.module';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { StoreModule } from '@app/store/store.module';
import { OfferedProductsModule } from '@app/offered-products/offered-products.module';
import { DeliveryStrategiesModule } from '@app/delivery-strategies/delivery-strategies.module';
import { PickupPointsModule } from '@app/pickup-points/pickup-points.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [DatabaseConfig]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    ProductModule,
    TelegramModule,
    OrderModule,
    StatisticModule,
    FileUploaderModule,
    AuthModule,
    DeliveryAreaModule,
    DadataModule,
    AddressesModule,
    StoreUserModule,
    StoreModule,
    OfferedProductsModule,
    DeliveryStrategiesModule,
    PickupPointsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}

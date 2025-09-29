import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramService } from './telegram.service';
import { TelegramErrorService } from './telegram-error.service';
import { TelegramErrorNotificationService } from './telegram-error-notification.service';
import { TelegramController } from './telegram.controller';
import { AuthModule } from '../auth/auth.module';
import { OrderEntity } from '@core/entities/order.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { StoreModule } from '@app/store/store.module';
import { BasketModule } from '@app/basket/basket.module';
import { UsersService } from '@app/users/users.service';
import { UsersModule } from '@app/users/users.module';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { StoreService } from '@app/store/store.service';
import type { Cache } from 'cache-manager';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { StoreUserService } from '@app/store-user/store-user.service';

@Module({
  imports: [
    ConfigModule.forRoot(), // Добавлен forRoot() для правильной инициализации
    CacheModule.register(),
    TypeOrmModule.forFeature([UsersEntity, OrderEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreModule),
    forwardRef(() => BasketModule),
    forwardRef(() => UsersModule),
    StoreUserModule
  ],
  providers: [
    UsersService,
    {
      provide: TelegramService,
      useFactory: (
        configService: ConfigService,
        usersService: UsersService,
        storeService: StoreService,
        storeUserService: StoreUserService,
        cacheManager: Cache
      ) => {
        return new TelegramService(
          configService, // Добавлен ConfigService
          usersService,
          storeUserService // StoreService больше не нужен в конструкторе TelegramService
        );
      },
      inject: [
        ConfigService, // Добавлен ConfigService
        UsersService, 
        StoreService, 
        StoreUserService, 
        CACHE_MANAGER
      ],
    },
    {
      provide: TelegramErrorService,
      useFactory: () => new TelegramErrorService(),
    },
    {
      provide: TelegramErrorNotificationService,
      useFactory: (telegramErrorService: TelegramErrorService) => {
        return new TelegramErrorNotificationService(telegramErrorService);
      },
      inject: [TelegramErrorService],
    },
  ],
  exports: [
    TelegramService,
    TelegramErrorService,
    TelegramErrorNotificationService,
  ],
  controllers: [TelegramController],
})
export class TelegramModule {}
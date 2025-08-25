import { forwardRef, Module } from '@nestjs/common';
import { StoreUserService } from './store-user.service';
import { StoreUserController } from './store-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreUserEntity } from '@core/entities/store-user.entity';
import { AuthModule } from '@app/auth/auth.module';
import { TelegramUtils } from '@app/utils/telegram.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreUserEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [StoreUserService, TelegramUtils],
  controllers: [StoreUserController],
  exports: [StoreUserService, TelegramUtils],
})
export class StoreUserModule {}


import { forwardRef, Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreEntity } from '@core/entities/store.entity';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity]),
    forwardRef(() => AuthModule),
    forwardRef(() => StoreUserModule),
  ],
  providers: [StoreService],
  controllers: [StoreController],
  exports: [StoreService],
})
export class StoreModule {}

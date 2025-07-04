import { forwardRef, Module } from '@nestjs/common';
import { StoreUserService } from './store-user.service';
import { StoreUserController } from './store-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreUserEntity } from '@core/entities/store-user.entity';
import { AuthModule } from '@app/auth/auth.module';
import { StoreModule } from '@app/store/store.module';
import { OfferedProductsModule } from '@app/offered-products/offered-products.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([StoreUserEntity]),
    forwardRef(() => AuthModule)
  ],
  providers: [StoreUserService],
  controllers: [StoreUserController],
  exports: [StoreUserService],
})
export class StoreUserModule {}

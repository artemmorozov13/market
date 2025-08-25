import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from '@app/users/users.module';
import { BasketEntity, ProductEntity, SelectedProductEntity, UsersEntity } from '@core/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      ProductEntity,
      UsersEntity,
      SelectedProductEntity
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule)
  ],
  providers: [
    BasketService
  ],
  controllers: [BasketController],
  exports: [BasketService],
})
export class BasketModule {}
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { AuthModule } from 'src/auth/auth.module';
import { BasketEntity } from '@core/entities/basket.entity';
import { ProductEntity } from '@core/entities/product.entity';
import { UsersEntity } from '@core/entities/users.entity';
import { SelectedProductEntity } from '@core/entities/selected-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      ProductEntity,
      UsersEntity,
      SelectedProductEntity
    ]),
    forwardRef(() => AuthModule)
  ],
  providers: [BasketService],
  controllers: [BasketController],
  exports: [BasketService],
})
export class BasketModule {}
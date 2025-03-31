import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { BasketEntity } from '../entities/basket.entity';
import { ProductEntity } from '../entities/product.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BasketEntity,
      ProductEntity,
      UsersEntity,
      SelectedProductEntity
    ]),
  ],
  providers: [BasketService],
  controllers: [BasketController],
  exports: [BasketService],
})
export class BasketModule {}
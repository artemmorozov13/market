import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { BasketEntity } from '../entities/basket.entity';
import { ProductEntity } from '../entities/product.entity';
import { UsersEntity } from 'src/entities/users.entity';
import { SelectedProductEntity } from 'src/entities/selected-product.entity';
import { AuthModule } from 'src/auth/auth.module';

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
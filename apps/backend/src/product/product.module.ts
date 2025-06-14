import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductEntity } from '@core/entities/product.entity';
import { UsersModule } from '@app/users/users.module';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { ProductStoreResolver } from './lib/product-store-resolver';
import { ProductQueryBuilder } from './lib/product-query-builder';
import { ProductResponseBuilder } from './lib/product-response-builder';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    UsersModule,
    StoreUserModule,
    AuthModule
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductStoreResolver,
    ProductQueryBuilder,
    ProductResponseBuilder,
  ]
})
export class ProductModule {}

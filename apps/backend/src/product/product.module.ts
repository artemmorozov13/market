import { forwardRef, Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ProductEntity } from '@core/entities/product.entity';
import { UsersModule } from '@app/users/users.module';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { ProductResponseBuilder } from './lib/product-response-builder';
import { OfferedProductsModule } from '@app/offered-products/offered-products.module';
import { ProductUserResolver } from './lib/product-user-resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity]),
    UsersModule,
    StoreUserModule,
    AuthModule,
    forwardRef(() => OfferedProductsModule)
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductUserResolver,
    ProductResponseBuilder,
  ],
  exports: [ProductService]
})
export class ProductModule {}

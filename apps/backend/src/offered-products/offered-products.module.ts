import { forwardRef, Module } from '@nestjs/common';
import { OfferedProductsController } from './offered-products.controller';
import { OfferedProductsService } from './offered-products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { AuthModule } from '@app/auth/auth.module';
import { ProductModule } from '@app/product/product.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    StoreUserModule,
    AuthModule
  ],
  controllers: [OfferedProductsController],
  providers: [OfferedProductsService],
  exports: [OfferedProductsService]
})
export class OfferedProductsModule {}

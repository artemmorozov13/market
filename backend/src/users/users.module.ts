import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BasketModule } from '../basket/basket.module';
import { UsersEntity } from 'src/entities/users.entity';
import { AuthModule } from 'src/auth/auth.module';
import { OrderEntity } from 'src/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      OrderEntity
    ]),
    BasketModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
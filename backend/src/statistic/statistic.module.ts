import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { OrderModule } from 'src/order/order.module';
import { OrderEntity } from 'src/entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity
    ]),
    AuthModule,
  ],
  providers: [StatisticService],
  controllers: [StatisticController]
})
export class StatisticModule {}

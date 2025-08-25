import { Module } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { StatisticController } from './statistic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { OrderEntity } from '@core/entities/order.entity';

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

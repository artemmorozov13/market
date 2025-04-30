import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('statistic')
export class StatisticController {
    constructor(private statisticService: StatisticService) {}

    @Get("orders")
    @UseGuards(JwtAuthGuard)
    getOrderStatistic() {
        return this.statisticService.getOrderStatistic()
    }
}

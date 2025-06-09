import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';

@Controller('statistic')
export class StatisticController {
    constructor(private statisticService: StatisticService) {}

    @Get("orders")
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getOrderStatistic() {
        return this.statisticService.getOrderStatistic()
    }
}

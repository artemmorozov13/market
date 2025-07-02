import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';

@Controller('statistic')
export class StatisticController {
    constructor(private statisticService: StatisticService) {}

    @Get("orders")
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getOrderStatistic(@User() user: AuthJwtPayload) {
        return this.statisticService.getOrderStatistic(user)
    }
}

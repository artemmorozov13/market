import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { DeliveryStrategiesService } from './delivery-strategies.service';
import { AddStrategyToStoreDto } from './dto/add-strategy.dto';
import { UpdateStoreStrategyDto } from './dto/update-strategy.dto';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { AllowRoles } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';

@Controller('delivery-strategies')
export class DeliveryStrategiesController {
    constructor(private readonly strategiesService: DeliveryStrategiesService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getStrategiesList() {
        return this.strategiesService.getAllStrategies();
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('stores/:storeId')
    async getStoreStrategies(@Param('storeId') storeId: number) {
        return this.strategiesService.getStoreStrategies(storeId);
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('stores/:storeId')
    async addStrategy(
    @Param('storeId') storeId: number,
    @Body() dto: AddStrategyToStoreDto,
    ) {
        return this.strategiesService.addStrategyToStore(storeId, dto);
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Put('stores/:storeId')
    async updateStrategy(
    @Param('storeId') storeId: number,
    @Body() dto: UpdateStoreStrategyDto,
    ) {
        return this.strategiesService.updateStoreStrategy(storeId, dto);
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Delete('stores/:storeId/strategy/:strategyId')
    async removeStrategy(
    @Param('storeId') storeId: number,
    @Param('strategyId') strategyId: number,
    ) {
        return this.strategiesService.removeStrategyFromStore(storeId, strategyId);
    }
}
import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { AllowRoles } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { UpdateStoreDto } from './dto/updatestore.dto';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('store')
export class StoreController {
    constructor(
        private readonly storeService: StoreService
    ) {}

    @AllowRoles(Roles.User, Roles.Admin, Roles.SuperAdmin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getStoreData(@Param('id') id: string) {
        return this.storeService.getStoreDataById(Number(id))
    }

    @Post('create')
    createStore(@Body() body: CreateStoreDto) {
        return this.storeService.createStore(body)
    }

    @AllowRoles(Roles.Admin, Roles.SuperAdmin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Patch('update')
    updateStoreData(@User() user: AuthJwtPayload, @Body() body: UpdateStoreDto) {
        return this.storeService.updateStoreData(user, body)
    }
}
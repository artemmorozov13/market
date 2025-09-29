import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StoreUserService } from './store-user.service';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { CreateUserDto } from './dto/create-user.dto';
import { AllowRoles } from '@app/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from '@app/auth/guards/roles/roles.guard';
import { DeleteParamsDto } from './dto/delete-patams.dto';

@Controller('store-user')
export class StoreUserController {
    constructor(
        private readonly storeUserServuce: StoreUserService
    ) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    getStoreUserByToken(@User() user: AuthJwtPayload) {
        return this.storeUserServuce.getStoreUserById(user.id)
    }

    @Post('create/store')
    createUser(@Body() body: CreateUserDto) {
        return this.storeUserServuce.createUser(body)
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Post('create/vendor')
    createStoreVendorUser(
        @User() user: AuthJwtPayload,
        @Body() body: CreateUserDto
    ) {
        return this.storeUserServuce.createVendorUser(user, body)
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Delete('vendor/:vendorId')
    deleteVendor(
        @Param() params: DeleteParamsDto,
        @User() user: AuthJwtPayload
    ) {
        return this.storeUserServuce.deleteVendor(user, params)
    }

    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    @Get('vendor-list')
    getVendorList(@User() user: AuthJwtPayload) {
        return this.storeUserServuce.getVendorList(user)
    }
}

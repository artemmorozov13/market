import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from '@core/enums/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user-dto';
import { TelegramLoginDto } from './dto/telegram-connect.dto';
import { TelegramAuthData } from '@app/telegram/types/telegram-user-types';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUserByToken(@User() user: AuthJwtPayload) {
        return this.usersService.getUserById(user.id)
    }

    @Get('order')
    @UseGuards(JwtAuthGuard)
    getActiveOrders(@User() user: AuthJwtPayload) {
        return this.usersService.getUserById(user.id)
    }

    @Get("list")
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getUsersList(@Query() query: GetQueryParamsDto) {
        return this.usersService.getUsersDataList(query)
    }

    @Post("create")
    createNewUser(@Body() body: CreateUserBodyDto) {
        return this.usersService.createUser(body)
    }

    @Patch("update")
    @AllowRoles(Roles.Admin, Roles.User)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    updateUserData(
        @User() user: AuthJwtPayload,
        @Body() body: UpdateUserDto
    ) {
        return this.usersService.updateUser(user, body)
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('login')
    loginWithtoken(@User() user: AuthJwtPayload) {
        return this.usersService.login(user)
    }

    @Post('login-telegram')
    loginWithTelegram(@Body() body: TelegramLoginDto) {
        return this.usersService.loginViaTelegram(body);
    }

    @UseGuards(JwtAuthGuard)
    @Post('telegram-connect')
    connectTelegram(@User() user: AuthJwtPayload, @Body() body: TelegramLoginDto) {
        return this.usersService.connectTelegram(user, body)
    }
}

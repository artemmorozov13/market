import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { Roles } from 'src/auth/types/role-enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { TelegramAuthData } from 'src/telegram/types/telegram-user-types';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getUserByToken(@User() user: AuthJwtPayload) {
        return this.usersService.getUserById(user.sub)
    }

    @Get('order')
    @UseGuards(JwtAuthGuard)
    getActiveOrders(@User() user: AuthJwtPayload) {
        return this.usersService.getUserById(user.sub)
    }

    @Get("list")
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    getUsersList(@Query() query: GetQueryParamsDto) {
        return this.usersService.getUsersDataList(query)
    }

    @Post("create")
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    createNewUser(@Body() body: CreateUserBodyDto) {
        return this.usersService.createUser(body)
    }

    @Post('login')
    loginWithTelegram(@Body() body: TelegramLoginDto) {
        return this.usersService.loginWithTelegram(body.initData);
    }

    @Post('login-widget')
    loginWithTelegramWidget(@Body() body: TelegramAuthData) {
        return this.usersService.loginWithTelegramWidget(body)
    }
}

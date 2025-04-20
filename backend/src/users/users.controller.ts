import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateUserBodyDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { GetQueryParamsDto } from './dto/get-query-params.dto';
import { TelegramLoginDto } from './dto/telegram-login.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
        this.usersService = usersService
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getUserByToken(@Req() req) {
        return this.usersService.getUserById(req.user.id)
    }

    @Get('order')
    getActiveOrders(@Req() req) {
        return this.usersService.getUserById(req.user.id)
    }

    @UseGuards(JwtAuthGuard)
    @Get("list")
    getUsersList(@Query() query: GetQueryParamsDto) {
        return this.usersService.getUsersDataList(query)
    }

    @Post("create")
    createNewUser(@Body() body: CreateUserBodyDto) {
        return this.usersService.createUser(body)
    }

    @Post('login')
    loginWithTelegram(@Body() body: TelegramLoginDto) {
        return this.usersService.loginWithTelegram(body.initData);
    }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StoreUserService } from './store-user.service';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth/jwt-auth.guard';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';
import { CreateUserDto } from './dto/create-user.dto';

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

    @Post('create')
    createUser(@Body() body: CreateUserDto) {
        return this.storeUserServuce.createUser(body)
    }
}

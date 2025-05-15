import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/types/role-enum';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('broadcast')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    async broadcastMessage(@Body() body: { message: string }) {
        await this.telegramService.broadcastMessage(body.message);
        return { success: true };
    }
}

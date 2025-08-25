import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AllowRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from '@core/enums/role-enum';
import { TelegramService } from './telegram.service';
import { User } from '@app/decorators/user.decorator';
import { AuthJwtPayload } from '@core/types/user-type';

@Controller('telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('broadcast')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    async broadcastMessage(
        @User() user: AuthJwtPayload,
        @Body() body: { message: string }
    ) {
        await this.telegramService.broadcastMessage(user, body.message);
        return { success: true };
    }

    @Post('test-message')
    @AllowRoles(Roles.Admin)
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    async sendTestMessage(@User() user: AuthJwtPayload) {
        const result = await this.telegramService.sendTestMessage(user);
        return {
            success: result.success,
            message: result.success 
                ? 'Тестовое сообщение успешно отправлено' 
                : 'Не удалось отправить тестовое сообщение: ' + result.error
        };
    }
}

import { Body, Controller, HttpCode, HttpStatus, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { TelegramAuthData } from 'src/telegram/types/telegram-user-types';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async authWithPassword(@Request() req) {
    return this.authService.authAdminUser(req.user.id)
  }

  @Post('login/telegram')
  async loginWebViaTelegram(@Body() initData: TelegramAuthData) {
    return this.authService.loginWithTelegramWidget(initData)
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(@Req() req) {
    return this.authService.refreshAccessToken(req.user.id)
  }
}

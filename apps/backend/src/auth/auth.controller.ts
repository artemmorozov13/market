import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { LoginViaInitDataDto } from './dto/auth-via-telegram-widget.dto';
import { AuthStoreUserDto } from './dto/auth-store-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async authWithPassword(@Body() body: AuthStoreUserDto) {
    return this.authService.authAdminUser(body)
  }
  
  @Post('login-telegram')
  async loginWebViaTelegram(@Body() body: LoginViaInitDataDto) {
    return this.authService.loginWithTelegramWidget(body.initData)
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(@Req() req) {
    return this.authService.refreshAccessToken(req.user.id)
  }
}

import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth.jwtPayload';
import { UsersEntity } from 'src/entities/users.entity';
import { Roles } from './types/role-enum';
import { TelegramAuthData } from 'src/telegram/types/telegram-user-types';
import { TelegramUtils } from 'src/utils/telegram.utils';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private jwtService: JwtService,
        @Inject(refreshJwtConfig.KEY)
        private refreshTokenConfig:ConfigType<typeof refreshJwtConfig>
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.userService.findUserByEmail(email)

        if (!user) {
            throw new UnauthorizedException("пользователь не найден" + email)
          }
      
          const isPasswordsComapre = await bcrypt.compare(password, user.password)
      
          if (!isPasswordsComapre) {
            throw new UnauthorizedException("Неверный пароль")
          }
          
          return {
            id: user.id,
            telegram_id: user.telegram_id,
            telegram_username: user.telegram_username,
            name: user.name,
            phone_number: user.phone_number,
            is_phone_confirmed: user.is_phone_confirmed,
            email: user.email,
            age: user.age,
          }
    }

    async generateToken(user: UsersEntity) {
      const currentUser: AuthJwtPayload = {
        sub: user.id,
        role: user.role
      }
      return this.jwtService.sign(currentUser)
    }

    async generateRefreshToken(user: UsersEntity) {
      const currentUser: AuthJwtPayload = {
        sub: user.id,
        role: user.role
      }
      return this.jwtService.sign(currentUser, this.refreshTokenConfig)
    }

    async validateJwtUser(payload: AuthJwtPayload) {
      const user = await this.userService.getUserById(payload.sub)

      if (!user) {
        throw new UnauthorizedException("User not found")
      }

      const currentUser: AuthJwtPayload = {
        sub: user.id,
        role: user.role
      }

      return currentUser
    }

    async authAdminUser(userId: number) {
      const user = await this.userService.getUserById(userId)

      if (!user) {
        throw new UnauthorizedException("Пользователь не найден")
      }

      if (user.role !== Roles.Admin) {
        throw new UnauthorizedException("У пользователя недостаточно прав для доступа")
      }

      const token = await this.generateToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return {
        user,
        token,
        refreshToken
      }
    }

    async loginWithTelegramWidget(initData: string) {
      const isValid = await TelegramUtils.validateInitData(initData);
      if (!isValid) {
        throw new UnauthorizedException('Invalid Telegram data');
      }

      try {
        const telegramData = TelegramUtils.parseInitData(initData)

        let user = await this.userService.getUserByTelegramId(telegramData.id);

        if (!user) {
          user = await this.userService.createUser({
            telegram_id: telegramData.id,
            name: telegramData.first_name,
            telegram_username: telegramData.username,
            role: Roles.User
          });
        }

        const token = await this.generateToken(user)
        const refreshToken = await this.generateRefreshToken(user);

        return {
          user,
          token,
          refreshToken
        };
      } catch (error) {
        throw error
      }
    }

    async refreshAccessToken(userId: number) {
      const user = await this.userService.getUserById(userId)

      if (!user) {
        throw new UnauthorizedException("Пользователь не найден")
      }

      const token = await this.generateToken(user);

      return {
        user,
        token
      }
    }
}

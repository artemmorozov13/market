import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import * as bcrypt from "bcryptjs"
import { JwtService } from '@nestjs/jwt';
import { TelegramAuthData } from 'src/telegram/types/telegram-user-types';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import { UsersEntity } from '@core/entities/users.entity';
import { Roles } from '@core/enums/role-enum';
import { AuthJwtPayload } from '@core/types/user-type';
import { AuthStoreUserDto } from './dto/auth-store-user.dto';
import { StoreUserService } from '@app/store-user/store-user.service';
import { StoreUserEntity } from '@core/entities/store-user.entity';
import { UsersService } from '@app/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private jwtService: JwtService,
        private storeUserService: StoreUserService,
        @Inject(refreshJwtConfig.KEY)
        private refreshTokenConfig:ConfigType<typeof refreshJwtConfig>
    ) {}

    async validateUser(email: string, password: string) {
        const user = await this.storeUserService.getStoreUserByEmail(email)

        if (!user) {
          throw new UnauthorizedException("пользователь не найден" + email)
        }
    
        const isPasswordsComapre = await bcrypt.compare(password, user.password)
    
        if (!isPasswordsComapre) {
          throw new UnauthorizedException("Неверный пароль")
        }
        
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          store: user.store
        }
    }

    async generateToken(user: UsersEntity | StoreUserEntity) {
      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role
      }
      return this.jwtService.sign(currentUser)
    }

    async generateRefreshToken(user: UsersEntity | StoreUserEntity) {
      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role
      }
      return this.jwtService.sign(currentUser, this.refreshTokenConfig)
    }

    async validateJwtUser(payload: AuthJwtPayload) {
      const user = await this.userService.getUserById(payload.id)

      if (!user) {
        throw new UnauthorizedException("User not found")
      }

      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role
      }

      return currentUser
    }

    async authAdminUser(userData: AuthStoreUserDto) {
      const user = await this.storeUserService.getStoreUserByEmail(userData.email);

      const token = await this.generateToken(user);
      const refreshToken = await this.generateRefreshToken(user);

      return {
        user,
        token,
        refreshToken
      }
    }

    async loginWithTelegramWidget(initData: TelegramAuthData) {
      try {
        let user = await this.userService.getUserByTelegramId(initData.id);

        if (!user) {
          user = await this.userService.createUser({
            telegram_id: initData.id,
            name: initData.first_name,
            telegram_username: initData.username,
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

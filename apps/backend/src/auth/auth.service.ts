import { BadRequestException, Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
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
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private jwtService: JwtService,
        private storeUserService: StoreUserService,
        @Inject(refreshJwtConfig.KEY)
        private refreshTokenConfig:ConfigType<typeof refreshJwtConfig>,
    ) {}

    async generateToken(user: AuthJwtPayload | UsersEntity | StoreUserEntity ) {
      if (user.role === Roles.Admin) {
        const currentUser: AuthJwtPayload = {
          id: user.id,
          role: user.role,
          storeId: (user as StoreUserEntity)?.store?.id || (user as AuthJwtPayload)?.storeId
        }
        return await this.jwtService.sign(currentUser)
      }
      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role,
      }
      return await this.jwtService.sign(currentUser)
    }

    async generateRefreshToken(user: UsersEntity | StoreUserEntity) {
      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role
      }
      if (user.role === Roles.Admin) {
        currentUser.storeId = (user as StoreUserEntity).store.id;
      }
      return this.jwtService.sign(currentUser, this.refreshTokenConfig)
    }

    async validateStoreUser(payload: AuthJwtPayload) {
      const user = await this.storeUserService.getStoreUserById(payload.id)
  
      const currentUser: AuthJwtPayload = {
        id: user.id,
        role: user.role
      }

      return currentUser
    }

    async compareUserByEmail(email: string, password: string) {
      const user = await this.storeUserService.getStoreUserByEmail(email);
      if (!user) {
        throw new BadRequestException("Ошибка при вводе логина или пароля");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException("Ошибка при вводе логина или пароля");
      }

      return {
        id: user.id,
        role: user.role
      };
    }

    async validateUser(payload: AuthJwtPayload) {
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
}

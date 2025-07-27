import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { BasketModule } from 'src/basket/basket.module';
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshJwtConfig from './config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { StoreUserModule } from '@app/store-user/store-user.module';
import { StoreModule } from '@app/store/store.module';
import { BasketEntity, UsersEntity } from '@core/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forFeature([UsersEntity, BasketEntity]),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    forwardRef(() => UsersModule),
    forwardRef(() => BasketModule),
    forwardRef(() => StoreUserModule),
    forwardRef(() => StoreModule)
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
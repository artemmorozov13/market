import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entities/users.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { BasketEntity } from 'src/entities/basket.entity';
import { UsersModule } from 'src/users/users.module';
import { BasketModule } from 'src/basket/basket.module';
import { JwtModule } from "@nestjs/jwt";
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    TypeOrmModule.forFeature([UsersEntity, BasketEntity]),
    ConfigModule.forFeature(jwtConfig),
    forwardRef(() => UsersModule),
    BasketModule,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
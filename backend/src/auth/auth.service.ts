import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth.jwtPayload';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private userService: UsersService,
        private jwtService: JwtService
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

    generateToken(userId) {
      const payload: AuthJwtPayload = { sub: userId }
      return this.jwtService.sign(payload)
    }
}

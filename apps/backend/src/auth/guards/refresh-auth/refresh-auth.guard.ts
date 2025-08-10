import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedException('Refresh token не предоставлен');
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException('Неверный формат refresh token');
      }

      // Верифицируем refresh token (используем другой секрет, если нужно)
      const user = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET, // или ваш refresh secret
      });

      // Добавляем пользователя и сам refresh token в request
      request.user = user;
      request.refreshToken = token; // Сохраняем refresh token для возможного использования

      return true;
    } catch(e) {
      console.log(e);
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }
}
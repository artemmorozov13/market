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

      const user = this.jwtService.verify(token, {
        secret: process.env.REFRESH_JWT_SECRET_KEY,
      });

      request.user = user;
      request.refreshToken = token;

      return true;
    } catch(e) {
      console.log(e);
      throw new UnauthorizedException('Недействительный refresh token');
    }
  }
}
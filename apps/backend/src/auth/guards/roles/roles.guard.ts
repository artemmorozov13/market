import { Roles } from '@core/enums/role-enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    const user = context.switchToHttp().getRequest().user;
    const hasRequiredRole = requiredRoles.some(requiredRole => requiredRole === user.role)
    
    return hasRequiredRole
  }
}

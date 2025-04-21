// src/common/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthJwtPayload } from 'src/auth/types/auth.jwtPayload';

export const User = createParamDecorator<AuthJwtPayload>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
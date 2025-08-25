import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthJwtPayload } from '@core/types/user-type';

export const User = createParamDecorator<AuthJwtPayload>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
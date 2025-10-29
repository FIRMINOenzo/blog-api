import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AccountEntity => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AccountEntity;
  },
);

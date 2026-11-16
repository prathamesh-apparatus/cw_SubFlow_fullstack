import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentAdmin = createParamDecorator((_d: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().admin);

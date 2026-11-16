import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.cookies?.subflow_token || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Authentication required');
    try { req.admin = await this.jwt.verifyAsync(token); return true; }
    catch { throw new UnauthorizedException('Invalid or expired session'); }
  }
}

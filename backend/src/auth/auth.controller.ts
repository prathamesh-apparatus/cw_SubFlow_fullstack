import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin } = await this.auth.login(dto.email, dto.password);
    res.cookie('subflow_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    return { success: true, data: admin };
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) { res.clearCookie('subflow_token', { path: '/' }); return { success: true, data: null }; }
  @UseGuards(JwtAuthGuard) @Get('me')
  me(@CurrentAdmin() admin: any) { return { success: true, data: { id: admin.sub, email: admin.email } }; }
}

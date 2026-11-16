import { Body, Controller, Get, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
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
  @UseGuards(JwtAuthGuard) @Patch('change-password')
  async changePassword(@CurrentAdmin() admin: any, @Body() dto: ChangePasswordDto) {
    await this.auth.changePassword(admin.sub, dto.currentPassword, dto.newPassword);
    return { success: true, data: null };
  }
  @UseGuards(JwtAuthGuard) @Patch('profile')
  async updateProfile(@CurrentAdmin() admin: any, @Body() dto: UpdateProfileDto, @Res({ passthrough: true }) res: Response) {
    const { token, admin: updated } = await this.auth.updateEmail(admin.sub, dto.email);
    res.cookie('subflow_token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
    return { success: true, data: updated };
  }
}

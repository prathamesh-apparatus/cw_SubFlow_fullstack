import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
@Module({
  // global: true — JwtAuthGuard is applied in the Categories/Subscriptions/Dashboard/
  // Renewals modules; JwtService must be injectable in every module context or the
  // app crashes at startup with "can't resolve dependencies of the JwtAuthGuard".
  imports: [JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'dev_secret_change_me_32_chars_long', signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } })],
  controllers: [AuthController], providers: [AuthService, JwtAuthGuard], exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}

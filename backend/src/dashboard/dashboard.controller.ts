import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard) @Controller('dashboard')
export class DashboardController {
  constructor(private svc: DashboardService) {}
  @Get('overview') async overview() { return { success: true, data: await this.svc.overview() }; }
  @Get('expenses') async expenses() { return { success: true, data: await this.svc.expenses() }; }
  @Get('category-breakdown') async breakdown() { return { success: true, data: await this.svc.categoryBreakdown() }; }
  @Get('recent-subscriptions') async recent() { return { success: true, data: await this.svc.recent() }; }
}

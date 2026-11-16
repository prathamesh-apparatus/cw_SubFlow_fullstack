import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RenewalsService } from './renewals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard) @Controller('renewals')
export class RenewalsController {
  constructor(private svc: RenewalsService) {}
  @Get() async all() { return { success: true, data: await this.svc.all() }; }
  @Get('upcoming') async upcoming(@Query('days') days = '30') { return { success: true, data: await this.svc.upcoming(parseInt(days, 10) || 30) }; }
  @Get('overdue') async overdue() { return { success: true, data: await this.svc.overdue() }; }
}

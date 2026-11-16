import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard) @Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}
  @Get() async list() { return { success: true, data: await this.svc.list() }; }
  @Get('unread-count') async unreadCount() { return { success: true, data: await this.svc.unreadCount() }; }
  @Post(':id/read') async markRead(@Param('id') id: string) { return { success: true, data: await this.svc.markRead(id) }; }
  @Post('read-all') async markAllRead() { return { success: true, data: await this.svc.markAllRead() }; }
}

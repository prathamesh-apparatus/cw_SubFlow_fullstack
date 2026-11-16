import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
@UseGuards(JwtAuthGuard) @Controller('subscriptions')
export class SubscriptionsController {
  constructor(private svc: SubscriptionsService) {}
  @Post() async create(@Body() dto: CreateSubscriptionDto) { return { success: true, data: await this.svc.create(dto) }; }
  @Get() async findAll(@Query() q: any) { return { success: true, data: await this.svc.findAll(q) }; }
  @Get(':id') async findOne(@Param('id') id: string) { return { success: true, data: await this.svc.findOne(id) }; }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: CreateSubscriptionDto) { return { success: true, data: await this.svc.update(id, dto) }; }
  @Delete(':id') async remove(@Param('id') id: string) { return { success: true, data: await this.svc.remove(id) }; }
}

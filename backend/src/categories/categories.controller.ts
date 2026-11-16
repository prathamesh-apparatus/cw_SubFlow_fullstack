import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
@UseGuards(JwtAuthGuard) @Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService, private subs: SubscriptionsService) {}
  @Post() async create(@Body() dto: CreateCategoryDto) { return { success: true, data: await this.svc.create(dto) }; }
  @Get() async findAll(@Query('search') search = '', @Query('sort') sort = 'name_asc') { return { success: true, data: await this.svc.findAll(search, sort) }; }
  @Get(':id') async findOne(@Param('id') id: string) { return { success: true, data: await this.svc.findOne(id) }; }
  @Get(':id/subscriptions') async subsFor(@Param('id') id: string, @Query() q: any) { return { success: true, data: await this.subs.findAll({ ...q, category_id: id }) }; }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) { return { success: true, data: await this.svc.update(id, dto) }; }
  @Delete(':id') async remove(@Param('id') id: string) { return { success: true, data: await this.svc.remove(id) }; }
}

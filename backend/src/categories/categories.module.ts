import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
@Module({ imports: [SubscriptionsModule], controllers: [CategoriesController], providers: [CategoriesService], exports: [CategoriesService] })
export class CategoriesModule {}

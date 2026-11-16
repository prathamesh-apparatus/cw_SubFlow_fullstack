import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RenewalsModule } from './renewals/renewals.module';
@Module({ imports: [DatabaseModule, AuthModule, CategoriesModule, SubscriptionsModule, DashboardModule, RenewalsModule] })
export class AppModule {}

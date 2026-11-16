import { Module } from '@nestjs/common';
import { RenewalsController } from './renewals.controller';
import { RenewalsService } from './renewals.service';
import { AuthModule } from '../auth/auth.module';
@Module({ imports: [AuthModule], controllers: [RenewalsController], providers: [RenewalsService] })
export class RenewalsModule {}

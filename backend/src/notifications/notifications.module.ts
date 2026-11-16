import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MailService } from './mail.service';
import { AuthModule } from '../auth/auth.module';
@Module({ imports: [AuthModule], controllers: [NotificationsController], providers: [NotificationsService, MailService] })
export class NotificationsModule {}

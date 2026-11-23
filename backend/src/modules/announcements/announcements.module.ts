import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AuthModule } from '../auth/auth.module';
import {
  Announcement,
  AnnouncementSchema,
} from './schemas/announcement.schema';
import {
  AdminAnnouncementsController,
  AnnouncementsController,
} from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

@Module({
  imports: [
    AuthModule,
    AuditLogsModule,
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AnnouncementsController, AdminAnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}

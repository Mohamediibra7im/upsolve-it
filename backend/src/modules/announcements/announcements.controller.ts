import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AdminGuard } from '../../common/guards/admin.guard';
import { AuthGuard } from '../../common/guards/auth.guard';
import { OptionalAuthGuard } from '../../common/guards/optional-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { AnnouncementDto } from './dto/announcement.dto';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  /** No auth required: anyone opening the site. Rate limited by RateLimiterGuard. */
  @UseGuards(OptionalAuthGuard)
  @Get('current')
  async current(
    @CurrentUser() user: UserDocument | null,
    @Query('member') member?: string,
  ) {
    // A signed-in browser says so with ?member=1. If its access cookie has
    // expired, the 401 makes the web app refresh it and ask again, instead of
    // quietly missing a members-only announcement.
    if (member && !user) throw new UnauthorizedException('Unauthorized');
    return { announcements: await this.announcements.current(!!user) };
  }
}

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/announcements')
export class AdminAnnouncementsController {
  constructor(private readonly announcements: AnnouncementsService) {}

  @Get()
  list(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    return this.announcements.list(
      Math.min(Math.max(Number.parseInt(limit ?? '') || 20, 1), 100),
      Math.max(Number.parseInt(offset ?? '') || 0, 0),
    );
  }

  @Post()
  create(@Body() body: AnnouncementDto, @CurrentUser() admin: UserDocument) {
    return this.announcements.create(body, admin);
  }

  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() body: AnnouncementDto,
    @CurrentUser() admin: UserDocument,
  ) {
    return this.announcements.update(id, body, admin);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @CurrentUser() admin: UserDocument,
  ) {
    return this.announcements.remove(id, admin);
  }
}

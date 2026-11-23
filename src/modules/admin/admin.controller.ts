import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { AdminService } from './admin.service';
import { UpdateRoleDto, SyncBatchDto } from './dto/admin.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Get('stats')
  async stats() {
    return await this.admin.stats();
  }

  /** Public — no auth required. Returns only the total user count. */
  @Get('users/count')
  async usersCount() {
    return await this.admin.getUserCount();
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('users')
  async users(@Query('page') page?: string, @Query('limit') limit?: string) {
    // limit=0 → return all (service caps at 5000 to bound the load).
    // A positive limit paginates; omitted defaults to all so the admin panel's
    // client-side table/search sees every user.
    const parsed = Number(limit);
    const effectiveLimit =
      Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 5000) : 0;
    return await this.admin.listUsers(page ? Number(page) : 1, effectiveLimit);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('users')
  async updateRole(
    @Body() body: UpdateRoleDto,
    @CurrentUser() current: UserDocument,
  ) {
    return await this.admin.updateUserRole(
      current._id.toString(),
      body.userId,
      body.role,
    );
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('users/:userId/stats')
  async userStats(@Param('userId') userId: string) {
    return await this.admin.userStats(userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('users/:userId/sync')
  async syncUserRating(
    @Param('userId') userId: string,
    @CurrentUser() current: UserDocument,
  ) {
    return await this.admin.syncUserRating(current._id.toString(), userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Post('users/sync-batch')
  async syncBatchUserRatings(
    @Body() body: SyncBatchDto,
    @CurrentUser() current: UserDocument,
  ) {
    return await this.admin.syncBatchUserRatings(
      current._id.toString(),
      body.userIds,
    );
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('users/:userId/lock')
  async lockUser(
    @Param('userId') userId: string,
    @CurrentUser() current: UserDocument,
  ) {
    return await this.admin.lockUser(current._id.toString(), userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch('users/:userId/unlock')
  async unlockUser(
    @Param('userId') userId: string,
    @CurrentUser() current: UserDocument,
  ) {
    return await this.admin.unlockUser(current._id.toString(), userId);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get('logs')
  async listLogs(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('performedByHandle') performedByHandle?: string,
  ) {
    return await this.admin.listLogs(
      limit ? Number.parseInt(limit) : undefined,
      offset ? Number.parseInt(offset) : undefined,
      { action, entity, performedByHandle },
    );
  }
}

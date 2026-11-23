import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { IsBoolean } from 'class-validator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { PublicProfileService } from './public-profile.service';

class PublicProfileSettingDto {
  @IsBoolean()
  publicProfile!: boolean;
}

@Controller('public-profile')
export class PublicProfileController {
  constructor(private readonly profiles: PublicProfileService) {}

  /** The caller's own setting. */
  @UseGuards(AuthGuard)
  @Get()
  setting(@CurrentUser() user: UserDocument) {
    return { publicProfile: user.publicProfile === true };
  }

  @UseGuards(AuthGuard)
  @Put()
  update(
    @CurrentUser() user: UserDocument,
    @Body() body: PublicProfileSettingDto,
  ) {
    return this.profiles.setEnabled(user._id.toString(), body.publicProfile);
  }

  /** No auth: anyone with the link. Rate limited by RateLimiterGuard. */
  @Get(':handle')
  read(@Param('handle') handle: string) {
    return this.profiles.getByHandle(handle);
  }
}

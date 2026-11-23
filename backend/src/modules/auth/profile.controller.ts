import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { UserDocument } from './schemas/user.schema';

@UseGuards(AuthGuard)
@Controller('users')
export class ProfileController {
  constructor(private readonly auth: AuthService) {}

  /** Name, bio, links and avatar of the caller. Never anyone else's. */
  @Patch('me/profile')
  update(@CurrentUser() user: UserDocument, @Body() body: UpdateProfileDto) {
    return this.auth.updateProfile(user._id.toString(), body);
  }
}

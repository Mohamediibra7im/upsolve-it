import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { AtcoderService } from './atcoder.service';

/**
 * AtCoder data for training sets. The browser asks here, not AtCoder Problems
 * directly, so one cached copy serves everyone and its request limit is kept.
 */
@Controller('atcoder')
export class AtcoderController {
  constructor(private readonly atcoder: AtcoderService) {}

  /** Every rated AtCoder task a set can draw from. */
  @UseGuards(AuthGuard)
  @Get('problems')
  async problems() {
    return { problems: await this.atcoder.trainingProblems() };
  }

  /** The caller's own AtCoder submissions; none without an AtCoder username. */
  @UseGuards(AuthGuard)
  @Get('submissions')
  async submissions(@CurrentUser() user: UserDocument) {
    const handle = user.links?.atcoder?.trim() || null;
    return {
      handle,
      submissions: handle ? await this.atcoder.submissionsOf(handle) : [],
    };
  }
}

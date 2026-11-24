import { Controller, Get, Header } from '@nestjs/common';
import { ContestsService } from './contests.service';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contests: ContestsService) {}

  /** No auth required: the public calendar. Rate limited by RateLimiterGuard. */
  @Get('upcoming')
  // The footer of every page reads this: let the browser keep it a while.
  @Header('Cache-Control', 'public, max-age=300')
  upcoming() {
    return this.contests.upcoming();
  }
}

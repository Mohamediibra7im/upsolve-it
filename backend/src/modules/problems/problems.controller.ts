import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ProblemRefDto } from '../upsolve/dto/upsolve-problem.dto';
import { ProblemsService } from './problems.service';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problems: ProblemsService) {}

  /** A problem's statement and sample tests, to read and test against on the site. */
  @UseGuards(AuthGuard)
  @Get('statement')
  async statement(@Query() query: ProblemRefDto) {
    const { judge, contestId, index } = query;
    // A query string has no numbers: a Codeforces contest id arrives as text.
    const s = await this.problems.statement(
      judge ?? 'codeforces',
      contestId,
      index,
    );
    return {
      judge: s.judge,
      contestId: s.contestId,
      index: s.index,
      title: s.title,
      timeLimit: s.timeLimit,
      memoryLimit: s.memoryLimit,
      sections: s.sections,
      samples: s.samples,
      sourceUrl: s.sourceUrl,
    };
  }
}

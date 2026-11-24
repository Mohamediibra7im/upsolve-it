import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ProblemsService } from '../problems/problems.service';
import { LANGUAGES, RunnerService, type Language } from './runner.service';

/**
 * The only problems a visitor without an account can read and run code on.
 * Nothing a visitor sends chooses a problem outside this list.
 */
export const TRY_PROBLEMS = {
  watermelon: { judge: 'codeforces', contestId: 4, index: 'A' },
  'long-words': { judge: 'codeforces', contestId: 71, index: 'A' },
  product: { judge: 'atcoder', contestId: 'abc086', index: 'A' },
} as const;
export type TryProblem = keyof typeof TRY_PROBLEMS;

/**
 * Visitor runs allowed in one UTC day, all visitors together.
 * ponytail: counted in this process, so it starts again at a restart and each
 * API machine keeps its own count: the real ceiling is this number times the
 * machines running. Keep the count in Mongo when the runner's quota needs one
 * exact number.
 */
export const TRY_RUNS_PER_DAY = 300;

export class TryProblemDto {
  @IsIn(Object.keys(TRY_PROBLEMS))
  problem!: TryProblem;
}

/** There is no field for inputs: the server takes them from its own copy of the problem. */
export class TryRunDto extends TryProblemDto {
  @IsIn(Object.keys(LANGUAGES))
  language!: Language;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64_000, { message: 'The code is too long to run here.' })
  code!: string;
}

/**
 * The solve workspace for a visitor with no account: a few fixed problems,
 * and code run on their samples only. Both routes are public and limited per
 * address in the rate limiter; runs also share one daily allowance.
 */
@Controller('run/try')
export class TryController {
  private day = '';
  private runsToday = 0;

  constructor(
    private readonly problems: ProblemsService,
    private readonly runner: RunnerService,
  ) {}

  private stored(problem: TryProblem) {
    const { judge, contestId, index } = TRY_PROBLEMS[problem];
    return this.problems.statement(judge, contestId, index);
  }

  /** The statement and samples of one of the fixed problems. */
  @Get('statement')
  async statement(@Query() query: TryProblemDto) {
    const s = await this.stored(query.problem);
    return {
      title: s.title,
      timeLimit: s.timeLimit,
      memoryLimit: s.memoryLimit,
      sections: s.sections,
      samples: s.samples,
      sourceUrl: s.sourceUrl,
    };
  }

  /** Runs the visitor's code on the stored samples of one fixed problem, one result per sample. */
  @Post()
  async run(@Body() body: TryRunDto) {
    const { samples } = await this.stored(body.problem);
    if (!samples.length)
      throw new ServiceUnavailableException(
        'This problem has no samples to run on right now.',
      );

    const today = new Date().toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.runsToday = 0;
    }
    if (this.runsToday >= TRY_RUNS_PER_DAY)
      throw new HttpException(
        'The free runs for today are used up. Create an account to keep running your code.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    // counted before the run, so runs that arrive together cannot pass the cap
    this.runsToday += 1;

    return {
      results: await this.runner.run(
        body.language,
        body.code,
        samples.map((sample) => sample.input),
      ),
    };
  }
}

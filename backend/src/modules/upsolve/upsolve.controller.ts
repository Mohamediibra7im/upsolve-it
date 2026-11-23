import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../auth/schemas/user.schema';
import { UpsolveService } from './upsolve.service';
import { UserStatsService } from '../user-stats/user-stats.service';
import {
  CreateUpsolveProblemDto,
  UpdateUpsolveProblemDto,
  AddByUrlDto,
  DeleteUpsolveProblemDto,
  UpsolveNoteDto,
} from './dto/upsolve-problem.dto';

@Controller('upsolve')
export class UpsolveController {
  constructor(
    private readonly upsolve: UpsolveService,
    private readonly userStats: UserStatsService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async list(@CurrentUser() user: UserDocument) {
    const userId = user._id.toString();
    const [items, dismissed] = await Promise.all([
      this.upsolve.list(userId),
      this.upsolve.listDismissed(userId),
    ]);
    return { items, dismissed };
  }

  @UseGuards(AuthGuard)
  @Post()
  async add(
    @CurrentUser() user: UserDocument,
    @Body(new ParseArrayPipe({ items: CreateUpsolveProblemDto }))
    problems: CreateUpsolveProblemDto[],
  ) {
    try {
      await this.upsolve.insertMany(user._id.toString(), problems);
      return { message: 'Upsolved problems added' };
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        return {
          message: 'Upsolved problems added (some may have been duplicates)',
        };
      }
      throw err;
    }
  }

  /** Add the problem a pasted link points to. */
  @UseGuards(AuthGuard)
  @Post('by-url')
  async addByUrl(@CurrentUser() user: UserDocument, @Body() body: AddByUrlDto) {
    return {
      problem: await this.upsolve.addByUrl(user._id.toString(), body.url),
    };
  }

  /** Import failed contest problems and refresh solved status from Codeforces. */
  @UseGuards(AuthGuard)
  @Post('sync')
  async sync(@CurrentUser() user: UserDocument) {
    const userId = user._id.toString();
    const result = await this.upsolve.syncFromCodeforces(
      userId,
      user.codeforcesHandle,
    );
    if (result.solved > 0) await this.userStats.recordUpsolveSolved(userId);
    return result;
  }

  @UseGuards(AuthGuard)
  @Put()
  async update(
    @CurrentUser() user: UserDocument,
    @Body(new ParseArrayPipe({ items: UpdateUpsolveProblemDto }))
    problems: UpdateUpsolveProblemDto[],
  ) {
    await this.upsolve.bulkUpdateSolvedTime(user._id.toString(), problems);
    if (problems.some((p: { solvedTime?: number | null }) => p.solvedTime)) {
      await this.userStats.recordUpsolveSolved(user._id.toString());
    }
    return { message: 'Upsolved problems updated' };
  }

  @UseGuards(AuthGuard)
  @Put('note')
  async note(@CurrentUser() user: UserDocument, @Body() body: UpsolveNoteDto) {
    await this.upsolve.setNote(user._id.toString(), body, body.note);
    return { message: 'Note saved' };
  }

  @UseGuards(AuthGuard)
  @Delete()
  async remove(
    @CurrentUser() user: UserDocument,
    @Body() body: DeleteUpsolveProblemDto,
  ) {
    await this.upsolve.deleteOne(user._id.toString(), body);
    return { message: 'Problem deleted from upsolve list' };
  }
}

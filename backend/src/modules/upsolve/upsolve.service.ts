import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import {
  UpsolvedProblem,
  type UpsolvedProblemDocument,
} from './schemas/upsolved-problem.schema';
import {
  DismissedUpsolve,
  type DismissedUpsolveDocument,
} from './schemas/dismissed-upsolve.schema';
import {
  fetchCodeforcesProblemset,
  fetchCodeforcesSubmissions,
} from '../../common/utils/codeforces-api';
import { parseProblemUrl } from './utils/problem-url';
import {
  afterResolve,
  planUnattempted,
  planUpsolveSync,
  type CfSubmission,
} from './utils/contest-sync';
import { problemKey, type ProblemRef } from './schemas/judge';

/** A Codeforces problem as the sync planner reads it. */
type CfTracked = {
  contestId: number;
  index: string;
  solvedTime?: number | null;
  resolveDueAt?: Date | null;
  resolveStage?: number;
};

/** The unique index from before problems carried a judge. */
const LEGACY_INDEX = 'user_1_contestId_1_index_1';

@Injectable()
export class UpsolveService implements OnModuleInit {
  private readonly logger = new Logger(UpsolveService.name);

  constructor(
    private readonly auth: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UpsolvedProblem.name)
    private readonly upsolveModel: Model<UpsolvedProblemDocument>,
    @InjectModel(DismissedUpsolve.name)
    private readonly dismissedModel: Model<DismissedUpsolveDocument>,
  ) {}

  /**
   * Records written before problems carried a judge are Codeforces problems.
   * Safe to run on every start: it only touches records still missing one.
   */
  async onModuleInit() {
    for (const model of [
      this.upsolveModel,
      this.dismissedModel,
    ] as Model<any>[]) {
      const { modifiedCount } = await model.updateMany(
        { judge: { $exists: false } },
        { $set: { judge: 'codeforces' } },
      );
      if (modifiedCount)
        this.logger.log(
          `Marked ${modifiedCount} ${model.modelName} records as Codeforces`,
        );
      // The old index would stop two judges from sharing a contest id.
      await model.collection.dropIndex(LEGACY_INDEX).catch(() => undefined);
    }
  }

  async list(userId: string) {
    return await this.upsolveModel
      .find({ user: userId })
      .sort({ createdAt: 1, _id: 1 })
      .limit(500);
  }

  /**
   * Returns all dismissed problem identifiers for a user.
   * The frontend uses this to prevent re-syncing deleted problems
   * from training history.
   */
  async listDismissed(userId: string) {
    return await this.dismissedModel
      .find({ user: userId })
      .limit(500)
      .select('judge contestId index -_id')
      .lean();
  }

  /**
   * Pulls the user's Codeforces submissions, adds problems they failed in
   * recent contests plus the first problem of each they never tried, and
   * marks tracked problems they have since solved.
   */
  async syncFromCodeforces(userId: string, handle: string) {
    const [submissions, tracked, dismissed] = await Promise.all([
      fetchCodeforcesSubmissions(handle),
      this.upsolveModel
        .find({ user: userId, judge: 'codeforces' })
        .select('contestId index solvedTime resolveDueAt resolveStage -_id')
        .lean<CfTracked[]>(),
      this.dismissedModel
        .find({ user: userId, judge: 'codeforces' })
        .select('contestId index -_id')
        .lean<CfTracked[]>(),
    ]);
    const { toAdd, solved, resolved } = planUpsolveSync(
      submissions as CfSubmission[],
      tracked,
      dismissed,
    );
    // Without the problem list this sync simply adds no unattempted problems.
    const problemset = await fetchCodeforcesProblemset().catch(() => null);
    const next = problemset
      ? planUnattempted(
          submissions as CfSubmission[],
          (contestId) => problemset.get(contestId),
          [...tracked, ...toAdd],
          dismissed,
        )
      : [];
    await this.insertMany(userId, [...toAdd, ...next]);
    if (solved.length) await this.bulkUpdateSolvedTime(userId, solved);
    if (resolved.length)
      await this.upsolveModel.bulkWrite(
        resolved.map((p) => ({
          updateOne: {
            filter: { user: userId, ...problemKey(p) },
            update: { $set: afterResolve(p.resolveStage, p.passedAt) },
          },
        })),
      );
    return {
      added: toAdd.length + next.length,
      solved: solved.length,
      resolved: resolved.length,
    };
  }

  async insertMany(userId: string, problems: (ProblemRef & object)[]) {
    if (!problems.length) return;
    await this.upsolveModel.bulkWrite(
      problems.map((p) => ({
        updateOne: {
          filter: { user: userId, ...problemKey(p) },
          update: { $setOnInsert: { ...p, ...problemKey(p), user: userId } },
          upsert: true,
        },
      })),
    );
  }

  /**
   * Marks problems solved, or unsolved with a null time. Solving schedules the
   * first re-solve, counted from now; only the first solve does, so marking a
   * solved problem again cannot restart its schedule.
   */
  async bulkUpdateSolvedTime(
    userId: string,
    problems: (ProblemRef & { solvedTime?: number | null })[],
    nowMs: number = Date.now(),
  ) {
    const bulkOps = problems.map((problem) => {
      const key = { user: userId, ...problemKey(problem) };
      return problem.solvedTime
        ? {
            updateOne: {
              filter: { ...key, solvedTime: null },
              update: {
                $set: {
                  solvedTime: problem.solvedTime,
                  ...afterResolve(0, nowMs),
                },
              },
            },
          }
        : {
            updateOne: {
              filter: key,
              update: {
                $set: { solvedTime: null, resolveStage: 0, resolveDueAt: null },
              },
            },
          };
    });
    await this.upsolveModel.bulkWrite(bulkOps);
  }

  /** Ends the re-solve schedule of a problem without solving it again. */
  async skipResolve(userId: string, problem: ProblemRef) {
    const { matchedCount } = await this.upsolveModel.updateOne(
      { user: userId, ...problemKey(problem), resolveDueAt: { $ne: null } },
      { $set: { resolveStage: 0, resolveDueAt: null } },
    );
    if (!matchedCount)
      throw new NotFoundException('That problem has no re-solve waiting.');
  }

  /** How many of the user's re-solves have come due. */
  async countResolvesDue(userId: string, nowMs: number = Date.now()) {
    return await this.upsolveModel.countDocuments({
      user: userId,
      resolveDueAt: { $ne: null, $lte: new Date(nowMs) },
    });
  }

  /**
   * Adds the problem a pasted link points to. Its name, rating and tags are
   * looked up here, never taken from the client. A problem the user dismissed
   * earlier comes back, and stays: nothing dismisses it again.
   */
  async addByUrl(userId: string, link: string) {
    const parsed = parseProblemUrl(link);
    if ('error' in parsed)
      throw new BadRequestException(
        parsed.error === 'gym'
          ? 'Gym problems cannot be added: they have no public problem page.'
          : 'That is not a link to a Codeforces problem.',
      );
    if (parsed.judge !== 'codeforces')
      throw new BadRequestException(
        'Only Codeforces problem links can be added for now.',
      );
    const key = problemKey(parsed);
    if (await this.upsolveModel.exists({ user: userId, ...key }))
      throw new ConflictException(
        'That problem is already in your upsolve list.',
      );

    // ponytail: a problem shared by two divisions is in the problemset under
    // one contest only; pasted from the other it is added without its details.
    const known = (await fetchCodeforcesProblemset().catch(() => null))
      ?.get(parsed.contestId as number)
      ?.find((p) => p.index === parsed.index);
    const problem = {
      ...key,
      name: known?.name ?? `Problem ${parsed.contestId}${parsed.index}`,
      rating: known?.rating ?? 0,
      tags: known?.tags ?? [],
      url: parsed.url,
      solvedTime: null,
      source: 'manual' as const,
    };
    await this.dismissedModel.deleteOne({ user: userId, ...key });
    await this.insertMany(userId, [problem]);
    return problem;
  }

  /** Saves the user's note on a problem of their own list. "" clears it. */
  async setNote(userId: string, problem: ProblemRef, note: string) {
    const { matchedCount } = await this.upsolveModel.updateOne(
      { user: userId, ...problemKey(problem) },
      { $set: { note: note.trim() } },
    );
    if (!matchedCount)
      throw new NotFoundException('That problem is not in your upsolve list.');
  }

  /**
   * Deletes a problem from the user's upsolve list AND records it
   * as dismissed so the auto-sync logic won't re-add it from
   * training history.
   */
  async deleteOne(userId: string, problem: ProblemRef) {
    const key = problemKey(problem);
    // 1. Remove the problem from the active upsolve list
    const deleteResult = await this.upsolveModel.deleteOne({
      user: userId,
      ...key,
    });

    // 2. Record the dismissal to prevent re-sync from history.
    //    Use upsert to avoid duplicate-key errors if the user
    //    somehow dismisses the same problem twice.
    if (deleteResult.deletedCount > 0) {
      await this.dismissedModel.updateOne(
        { user: userId, ...key },
        { $setOnInsert: { user: userId, ...key, dismissedAt: new Date() } },
        { upsert: true },
      );
    }

    return deleteResult;
  }
}

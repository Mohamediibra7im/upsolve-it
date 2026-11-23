import {
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
import { fetchCodeforcesSubmissions } from '../../common/utils/codeforces-api';
import { planUpsolveSync, type CfSubmission } from './utils/contest-sync';
import { problemKey, type ProblemRef } from './schemas/judge';

/** A Codeforces problem as the sync planner reads it. */
type CfTracked = {
  contestId: number;
  index: string;
  solvedTime?: number | null;
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
   * recent contests, and marks tracked problems they have since solved.
   */
  async syncFromCodeforces(userId: string, handle: string) {
    const [submissions, tracked, dismissed] = await Promise.all([
      fetchCodeforcesSubmissions(handle),
      this.upsolveModel
        .find({ user: userId, judge: 'codeforces' })
        .select('contestId index solvedTime -_id')
        .lean<CfTracked[]>(),
      this.dismissedModel
        .find({ user: userId, judge: 'codeforces' })
        .select('contestId index -_id')
        .lean<CfTracked[]>(),
    ]);
    const { toAdd, solved } = planUpsolveSync(
      submissions as CfSubmission[],
      tracked,
      dismissed,
    );
    await this.insertMany(userId, toAdd);
    if (solved.length) await this.bulkUpdateSolvedTime(userId, solved);
    return { added: toAdd.length, solved: solved.length };
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

  async bulkUpdateSolvedTime(
    userId: string,
    problems: (ProblemRef & { solvedTime?: number | null })[],
  ) {
    const bulkOps = problems.map((problem) => ({
      updateOne: {
        filter: { user: userId, ...problemKey(problem) },
        update: { $set: { solvedTime: problem.solvedTime } },
      },
    }));
    await this.upsolveModel.bulkWrite(bulkOps);
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

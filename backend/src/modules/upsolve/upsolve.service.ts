import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UpsolveService {
  constructor(
    private readonly auth: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UpsolvedProblem.name)
    private readonly upsolveModel: Model<UpsolvedProblemDocument>,
    @InjectModel(DismissedUpsolve.name)
    private readonly dismissedModel: Model<DismissedUpsolveDocument>,
  ) {}

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
      .select('contestId index -_id')
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
        .find({ user: userId })
        .select('contestId index solvedTime -_id')
        .lean(),
      this.dismissedModel
        .find({ user: userId })
        .select('contestId index -_id')
        .lean(),
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

  async insertMany(userId: string, problems: any[]) {
    if (!problems.length) return;
    await this.upsolveModel.bulkWrite(
      problems.map((p) => ({
        updateOne: {
          filter: { user: userId, contestId: p.contestId, index: p.index },
          update: { $setOnInsert: { ...p, user: userId } },
          upsert: true,
        },
      })),
    );
  }

  async bulkUpdateSolvedTime(userId: string, problems: any[]) {
    const bulkOps = problems.map((problem) => ({
      updateOne: {
        filter: {
          user: userId,
          contestId: problem.contestId,
          index: problem.index,
        },
        update: { $set: { solvedTime: problem.solvedTime } },
      },
    }));
    await this.upsolveModel.bulkWrite(bulkOps);
  }

  /**
   * Deletes a problem from the user's upsolve list AND records it
   * as dismissed so the auto-sync logic won't re-add it from
   * training history.
   */
  async deleteOne(userId: string, contestId: number, index: string) {
    // 1. Remove the problem from the active upsolve list
    const deleteResult = await this.upsolveModel.deleteOne({
      user: userId,
      contestId,
      index,
    });

    // 2. Record the dismissal to prevent re-sync from history.
    //    Use upsert to avoid duplicate-key errors if the user
    //    somehow dismisses the same problem twice.
    if (deleteResult.deletedCount > 0) {
      await this.dismissedModel.updateOne(
        { user: userId, contestId, index },
        {
          $setOnInsert: {
            user: userId,
            contestId,
            index,
            dismissedAt: new Date(),
          },
        },
        { upsert: true },
      );
    }

    return deleteResult;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminService } from '../admin/admin.service';
import { profileFields } from '../auth/auth.service';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import { isValidCodeforcesHandleFormat } from '../friends/utils/codeforces-handle';
import { escapeRegex } from '../friends/utils/escape-regex';
import { UserStatsService } from '../user-stats/user-stats.service';

@Injectable()
export class PublicProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly admin: AdminService,
    private readonly userStats: UserStatsService,
  ) {}

  async setEnabled(userId: string, publicProfile: boolean) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { publicProfile } },
    );
    return { publicProfile };
  }

  /**
   * The whole public surface of a user. Every field is listed by hand: nothing
   * else on the user or their history may be added without a privacy decision.
   * A malformed, unknown or opted-out handle takes the same path to the same 404.
   */
  async getByHandle(handle: string) {
    const user = isValidCodeforcesHandleFormat(handle)
      ? await this.userModel
          .findOne({
            codeforcesHandle: new RegExp(`^${escapeRegex(handle)}$`, 'i'),
            publicProfile: true,
            // an unverified account could carry someone else's handle
            isVerified: true,
          })
          .select(
            'codeforcesHandle avatar rating maxRating rank organization displayName bio links glyphAvatar',
          )
          .lean()
      : null;
    if (!user) throw new NotFoundException('Profile not found');

    const userId = String(user._id);
    // ponytail: reads the user's whole history on every request (the stat
    // assembly friends and admins already use); the web page caches it for
    // 5 minutes. Add a short per-handle cache here if direct traffic grows.
    const [{ stats }, activity] = await Promise.all([
      this.admin.userStats(userId),
      this.userStats.getPublicActivity(userId),
    ]);

    return {
      handle: user.codeforcesHandle,
      avatar: user.avatar,
      // typed by the user to be seen: name, bio, links and chosen avatar
      ...profileFields(user),
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      organization: user.organization || null,
      joined: user._id.getTimestamp().toISOString().slice(0, 7),
      stats: {
        sessions: stats.totalSessions,
        solved: stats.solvedProblems,
        upsolved: stats.upsolvedSolvedCount,
        // the upsolve queue as two counts; the problems themselves stay private
        upsolveTotal: stats.upsolvedCount,
        waiting: stats.upsolvedCount - stats.upsolvedSolvedCount,
        currentStreak: activity.currentStreak,
        longestStreak: activity.longestStreak,
      },
      activity: activity.activity,
    };
  }
}

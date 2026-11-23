import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserStats,
  type UserStatsDocument,
} from '../trainings/schemas/user-stats.schema';
import {
  Training,
  type TrainingDocument,
} from '../trainings/schemas/training.schema';
import {
  UpsolvedProblem,
  type UpsolvedProblemDocument,
} from '../upsolve/schemas/upsolved-problem.schema';
import { applyActivityToStreak } from '../trainings/utils/streak-logic';
import { addUtcDays, toUtcDayKey } from '../trainings/utils/date-key';
import { isProblemMarkedSolved } from '../trainings/utils/problem-solved';

@Injectable()
export class UserStatsService {
  constructor(
    @InjectModel(UserStats.name)
    private readonly userStatsModel: Model<UserStatsDocument>,
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,
    @InjectModel(UpsolvedProblem.name)
    private readonly upsolveModel: Model<UpsolvedProblemDocument>,
  ) {}

  async getOrCreate(userId: string): Promise<UserStatsDocument> {
    const id = new Types.ObjectId(userId);
    return await this.userStatsModel.findOneAndUpdate(
      { user: id },
      { $setOnInsert: { user: id } },
      { upsert: true, returnDocument: 'after' },
    );
  }

  async recordTrainingCompleted(userId: string, atMs: number = Date.now()) {
    const doc = await this.getOrCreate(userId);
    const upd = applyActivityToStreak(
      {
        currentStreak: doc.trainingStreak,
        bestStreak: doc.bestTrainingStreak,
        lastActivityDayKey: doc.lastTrainingActivityDate,
      },
      atMs,
    );
    doc.trainingStreak = upd.streak;
    doc.bestTrainingStreak = upd.best;
    doc.lastTrainingActivityDate = upd.lastDayKey;
    this.appendActiveDay(doc, upd.lastDayKey);
    await this.recomputeConsistency(userId, doc);
    await doc.save();
  }

  async recordUpsolveSolved(userId: string, atMs: number = Date.now()) {
    const doc = await this.getOrCreate(userId);
    const upd = applyActivityToStreak(
      {
        currentStreak: doc.upsolveStreak,
        bestStreak: doc.bestUpsolveStreak,
        lastActivityDayKey: doc.lastUpsolveActivityDate,
      },
      atMs,
    );
    doc.upsolveStreak = upd.streak;
    doc.bestUpsolveStreak = upd.best;
    doc.lastUpsolveActivityDate = upd.lastDayKey;
    this.appendActiveDay(doc, upd.lastDayKey);
    await this.recomputeConsistency(userId, doc);
    await doc.save();
  }

  private appendActiveDay(doc: UserStatsDocument, dayKey: string) {
    const set = new Set(doc.activeDays ?? []);
    set.add(dayKey);
    doc.activeDays = Array.from(set).sort().slice(-60);
  }

  private async recomputeConsistency(userId: string, doc: UserStatsDocument) {
    const now = Date.now();
    const dayMs = 86_400_000;
    const startWindow = now - 7 * dayMs;
    const days = new Set<string>();

    const trainings = await this.trainingModel
      .find({
        user: new Types.ObjectId(userId),
        $or: [{ status: 'completed' }, { status: { $exists: false } }],
        endTime: { $gte: startWindow },
      })
      .select('endTime')
      .lean();

    for (const t of trainings) {
      if (t.endTime) days.add(toUtcDayKey(t.endTime));
    }

    const ups = await this.upsolveModel
      .find({
        user: new Types.ObjectId(userId),
        solvedTime: { $ne: null, $gte: startWindow },
      })
      .select('solvedTime')
      .lean();

    for (const u of ups) {
      if (u.solvedTime) days.add(toUtcDayKey(u.solvedTime));
    }

    let activeInLast7 = 0;
    for (let i = 0; i < 7; i++) {
      const k = toUtcDayKey(now - i * dayMs);
      if (days.has(k)) activeInLast7++;
    }

    doc.consistencyScore = Math.round((activeInLast7 / 7) * 100);
  }

  /**
   * Streaks and solves per UTC day for the past year, for the public profile.
   * Read-only (unlike getStreakPayload): an anonymous request must never write.
   */
  async getPublicActivity(userId: string, nowMs: number = Date.now()) {
    const user = new Types.ObjectId(userId);
    const since = nowMs - 365 * 86_400_000;
    const [doc, trainings, upsolves] = await Promise.all([
      this.userStatsModel.findOne({ user }).lean(),
      this.trainingModel
        .find({ user, endTime: { $gte: since } })
        .select(
          'endTime problems.isSolved problems.solvedAt problems.solvedTime',
        )
        .lean(),
      this.upsolveModel
        .find({ user, solvedTime: { $ne: null, $gte: since } })
        .select('solvedTime')
        .lean(),
    ]);

    const activity: Record<string, number> = {};
    const add = (ms: number) => {
      if (ms < since || ms > nowMs) return;
      const key = toUtcDayKey(ms);
      activity[key] = (activity[key] ?? 0) + 1;
    };
    for (const t of trainings) {
      for (const p of t.problems ?? []) {
        if (isProblemMarkedSolved(p)) {
          add(p.solvedAt || p.solvedTime || t.endTime);
        }
      }
    }
    for (const u of upsolves) {
      if (u.solvedTime) add(u.solvedTime);
    }

    // A stored streak only counts while its last active day is today or yesterday.
    const today = toUtcDayKey(nowMs);
    const yesterday = addUtcDays(today, -1);
    const live = (streak = 0, last?: string | null) =>
      last === today || last === yesterday ? streak : 0;

    return {
      currentStreak: Math.max(
        live(doc?.trainingStreak, doc?.lastTrainingActivityDate),
        live(doc?.upsolveStreak, doc?.lastUpsolveActivityDate),
      ),
      longestStreak: Math.max(
        doc?.bestTrainingStreak ?? 0,
        doc?.bestUpsolveStreak ?? 0,
      ),
      activity,
    };
  }

  async getStreakPayload(userId: string) {
    const doc = await this.getOrCreate(userId);
    await this.recomputeConsistency(userId, doc);
    await doc.save();
    return {
      trainingStreak: doc.trainingStreak,
      upsolveStreak: doc.upsolveStreak,
      bestTrainingStreak: doc.bestTrainingStreak,
      bestUpsolveStreak: doc.bestUpsolveStreak,
      bestStreak: Math.max(doc.bestTrainingStreak, doc.bestUpsolveStreak),
      consistencyScore: doc.consistencyScore,
      lastTrainingActivityDate: doc.lastTrainingActivityDate,
      lastUpsolveActivityDate: doc.lastUpsolveActivityDate,
      activeDays: doc.activeDays ?? [],
    };
  }
}

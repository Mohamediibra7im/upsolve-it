import { Injectable } from '@nestjs/common';
import {
  fetchAtcoderCatalog,
  fetchAtcoderSubmissions,
  type AtcoderSubmission,
} from '../../common/utils/atcoder-api';

/** The newest submissions are asked for at most this often per handle. */
const MIN_GAP_MS = 15_000;
/** A first read goes back through the whole history: up to 10,000 submissions. */
const HISTORY_PAGES = 20;
/** Handles kept in memory; the one read longest ago makes room for a new one. */
const MAX_HANDLES = 500;

/**
 * An AtCoder difficulty as a rating on the Codeforces scale, where the levels
 * and slots of a training set live. The same number is harder on AtCoder, so
 * the estimate is stretched: 650 reads as 1200, 1400 as 1800, 2800 as 2900.
 *
 * ponytail: a straight line fitted by hand to a few known points, not an
 * official conversion. Change the two numbers here to tune every set.
 */
export function codeforcesRating(atcoderDifficulty: number) {
  const estimate = 0.8 * atcoderDifficulty + 680;
  return Math.min(3500, Math.max(800, Math.round(estimate / 100) * 100));
}

/** One submission in the shape of Codeforces `user.status`, which the app already reads. */
export type JudgeSubmission = {
  creationTimeSeconds: number;
  verdict: string;
  problem: { contestId: string; index: string };
};

/** Verdicts that are not a result yet: waiting for, or being, judged. */
const UNJUDGED = /^(WJ|WR|\d+\/\d+)/;

@Injectable()
export class AtcoderService {
  private readonly history = new Map<
    string,
    { submissions: AtcoderSubmission[]; fetchedAt: number }
  >();

  /** Every AtCoder task with a settled difficulty, rated on the Codeforces scale. */
  async trainingProblems() {
    const { problems } = await fetchAtcoderCatalog();
    return [...problems]
      .filter(([, p]) => p.difficulty !== undefined)
      .map(([taskId, p]) => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: codeforcesRating(p.difficulty!),
        difficulty: p.difficulty!,
        url: `https://atcoder.jp/contests/${p.contestId}/tasks/${taskId}`,
      }));
  }

  /**
   * Every submission of a handle, oldest first. The first call reads the whole
   * history; later ones only ask for what came after, and not more often than
   * every 15 seconds. If AtCoder Problems cannot be reached, what is already
   * known is returned rather than nothing.
   */
  async submissionsOf(
    handle: string,
    nowMs: number = Date.now(),
  ): Promise<JudgeSubmission[]> {
    const key = handle.trim().toLowerCase();
    const known = this.history.get(key);
    let submissions = known?.submissions ?? [];
    if (!known || nowMs - known.fetchedAt >= MIN_GAP_MS) {
      const last = submissions[submissions.length - 1];
      try {
        // From the last known second itself: two submissions can share one.
        const fresh = await fetchAtcoderSubmissions(
          key,
          last?.epoch_second ?? 0,
          known ? undefined : HISTORY_PAGES,
        );
        const seen = new Set(submissions.map((s) => s.id));
        submissions = [...submissions, ...fresh.filter((s) => !seen.has(s.id))];
      } catch (err) {
        if (!known) throw err;
      }
      this.history.delete(key);
      this.history.set(key, { submissions, fetchedAt: nowMs });
      if (this.history.size > MAX_HANDLES)
        this.history.delete(this.history.keys().next().value!);
    }

    const { problems } = await fetchAtcoderCatalog();
    return submissions.map((s) => ({
      creationTimeSeconds: s.epoch_second,
      verdict:
        s.result === 'AC'
          ? 'OK'
          : UNJUDGED.test(s.result)
            ? 'TESTING'
            : 'WRONG_ANSWER',
      problem: {
        contestId: s.contest_id,
        index:
          problems.get(s.problem_id)?.index ??
          s.problem_id.slice(s.problem_id.lastIndexOf('_') + 1).toUpperCase(),
      },
    }));
  }
}

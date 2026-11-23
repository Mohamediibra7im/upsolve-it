/** The subset of a Codeforces `user.status` submission this module reads. */
export type CfSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags?: string[];
  };
  author: { participantType: string };
};

export type ProblemKey = { contestId: number; index: string };

export type UpsolveCandidate = ProblemKey & {
  name: string;
  rating: number;
  tags: string[];
  url: string;
  solvedTime: null;
  createdAt: Date;
};

/** Submissions made while taking part in a contest, as opposed to practice. */
const CONTEST_PARTICIPATION = new Set([
  'CONTESTANT',
  'VIRTUAL',
  'OUT_OF_COMPETITION',
]);

/** Gym contests use ids from 100000 and have no public problemset page. */
const GYM_CONTEST_ID_START = 100000;

export const CONTEST_IMPORT_WINDOW_DAYS = 90;

const keyOf = (p: ProblemKey) => `${p.contestId}_${p.index}`;

/**
 * Decides what a sync should change, from the user's Codeforces submissions:
 * - `toAdd`: problems attempted during a recent contest and never solved since.
 * - `solved`: tracked problems that now have an accepted submission.
 *
 * ponytail: only problems the user submitted to are imported. Adding the first
 * unattempted problem of each contest needs the contest's problem list
 * (one more Codeforces call per contest); add it when that is worth the calls.
 */
export function planUpsolveSync(
  submissions: CfSubmission[],
  tracked: (ProblemKey & { solvedTime?: number | null })[],
  dismissed: ProblemKey[],
  nowMs: number = Date.now(),
): {
  toAdd: UpsolveCandidate[];
  solved: (ProblemKey & { solvedTime: number })[];
} {
  const firstAccepted = new Map<string, number>();
  for (const s of submissions) {
    if (s.verdict !== 'OK' || s.problem.contestId == null) continue;
    const key = keyOf(s.problem as ProblemKey);
    const prev = firstAccepted.get(key);
    if (prev === undefined || s.creationTimeSeconds < prev)
      firstAccepted.set(key, s.creationTimeSeconds);
  }

  const skip = new Set([...tracked, ...dismissed].map(keyOf));
  const windowStart = nowMs / 1000 - CONTEST_IMPORT_WINDOW_DAYS * 24 * 60 * 60;
  const toAdd = new Map<string, UpsolveCandidate>();
  for (const s of submissions) {
    const { contestId, index } = s.problem;
    if (contestId == null || contestId >= GYM_CONTEST_ID_START) continue;
    if (!CONTEST_PARTICIPATION.has(s.author.participantType)) continue;
    if (s.creationTimeSeconds < windowStart) continue;
    const key = keyOf({ contestId, index });
    if (firstAccepted.has(key) || skip.has(key) || toAdd.has(key)) continue;
    toAdd.set(key, {
      contestId,
      index,
      name: s.problem.name,
      rating: s.problem.rating ?? 0,
      tags: s.problem.tags ?? [],
      url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
      solvedTime: null,
      createdAt: new Date(s.creationTimeSeconds * 1000),
    });
  }

  const solved = tracked
    .filter((p) => !p.solvedTime && firstAccepted.has(keyOf(p)))
    .map((p) => ({
      contestId: p.contestId,
      index: p.index,
      solvedTime: firstAccepted.get(keyOf(p))! * 1000,
    }));

  return { toAdd: [...toAdd.values()], solved };
}

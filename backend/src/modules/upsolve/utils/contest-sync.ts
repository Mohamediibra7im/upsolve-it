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
  /** Left out for a problem the user tried and failed. */
  source?: 'unattempted';
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

/** A solved problem comes back after 7 days, and once more 30 days after that. */
export const RESOLVE_AFTER_DAYS = [7, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

/** What a re-solve of the given stage leaves behind when passed at `passedAt`. */
export function afterResolve(stage: number, passedAt: number) {
  const days = RESOLVE_AFTER_DAYS[stage];
  return days === undefined
    ? { resolveStage: 0, resolveDueAt: null }
    : {
        resolveStage: stage + 1,
        resolveDueAt: new Date(passedAt + days * DAY_MS),
      };
}

const keyOf = (p: ProblemKey) => `${p.contestId}_${p.index}`;

/**
 * Decides what a sync should change, from the user's Codeforces submissions:
 * - `toAdd`: problems attempted during a recent contest and never solved since.
 * - `solved`: tracked problems that now have an accepted submission.
 * - `resolved`: due re-solves with an accepted submission made after they
 *   came due. One made before the due date does not count.
 */
export function planUpsolveSync(
  submissions: CfSubmission[],
  tracked: (ProblemKey & {
    solvedTime?: number | null;
    resolveDueAt?: Date | null;
    resolveStage?: number;
  })[],
  dismissed: ProblemKey[],
  nowMs: number = Date.now(),
): {
  toAdd: UpsolveCandidate[];
  solved: (ProblemKey & { solvedTime: number })[];
  resolved: (ProblemKey & { resolveStage: number; passedAt: number })[];
} {
  const firstAccepted = new Map<string, number>();
  const accepted = new Map<string, number[]>();
  for (const s of submissions) {
    if (s.verdict !== 'OK' || s.problem.contestId == null) continue;
    const key = keyOf(s.problem as ProblemKey);
    const prev = firstAccepted.get(key);
    if (prev === undefined || s.creationTimeSeconds < prev)
      firstAccepted.set(key, s.creationTimeSeconds);
    accepted.set(key, [...(accepted.get(key) ?? []), s.creationTimeSeconds]);
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

  const resolved = tracked.flatMap((p) => {
    const due = p.resolveDueAt ? new Date(p.resolveDueAt).getTime() : null;
    if (due === null || due > nowMs) return [];
    const passes = (accepted.get(keyOf(p)) ?? [])
      .map((seconds) => seconds * 1000)
      .filter((at) => at >= due);
    return passes.length
      ? [
          {
            contestId: p.contestId,
            index: p.index,
            resolveStage: p.resolveStage ?? 1,
            passedAt: Math.min(...passes),
          },
        ]
      : [];
  });

  return { toAdd: [...toAdd.values()], solved, resolved };
}

/**
 * The next step up from each recent contest the user took part in: its first
 * problem, in contest order, they never submitted to. At most one per contest,
 * and none when that problem is already tracked or was dismissed.
 * `problemsOf` gives a contest's problems in order, or nothing if unknown.
 */
export function planUnattempted(
  submissions: CfSubmission[],
  problemsOf: (
    contestId: number,
  ) =>
    | { index: string; name: string; rating?: number; tags?: string[] }[]
    | undefined,
  tracked: ProblemKey[],
  dismissed: ProblemKey[],
  nowMs: number = Date.now(),
): UpsolveCandidate[] {
  const windowStart = nowMs / 1000 - CONTEST_IMPORT_WINDOW_DAYS * 24 * 60 * 60;
  const submitted = new Set<string>();
  /** contest → the user's last submission while taking part in it */
  const takenPart = new Map<number, number>();
  for (const s of submissions) {
    const { contestId, index } = s.problem;
    if (contestId == null) continue;
    submitted.add(keyOf({ contestId, index }));
    if (contestId >= GYM_CONTEST_ID_START) continue;
    if (!CONTEST_PARTICIPATION.has(s.author.participantType)) continue;
    if (s.creationTimeSeconds < windowStart) continue;
    takenPart.set(
      contestId,
      Math.max(takenPart.get(contestId) ?? 0, s.creationTimeSeconds),
    );
  }

  const skip = new Set([...tracked, ...dismissed].map(keyOf));
  const next: UpsolveCandidate[] = [];
  for (const [contestId, when] of takenPart) {
    const problem = problemsOf(contestId)?.find(
      (p) => !submitted.has(keyOf({ contestId, index: p.index })),
    );
    if (!problem || skip.has(keyOf({ contestId, index: problem.index })))
      continue;
    next.push({
      contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating ?? 0,
      tags: problem.tags ?? [],
      url: `https://codeforces.com/problemset/problem/${contestId}/${problem.index}`,
      solvedTime: null,
      createdAt: new Date(when * 1000),
      source: 'unattempted',
    });
  }
  return next;
}

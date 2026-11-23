import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import type { Training } from "@/types/Training";
import {
  isResolveDue,
  judgeOf,
  problemId,
  type UpsolveProblem,
} from "@/types/UpsolveProblem";

/**
 * One tile of a round's problem set. "none" is a problem the queue does not
 * hold; "resolve" is a solved one that has come back to be solved again.
 */
export type RoundSlot = {
  label: string;
  state: "solved" | "open" | "resolve" | "none";
};

/** The session or contest a group of queued problems came from. */
export type Round = {
  key: string;
  kind: "session" | "contest";
  title: string;
  /** Milliseconds since the epoch: when the round was played. */
  when: number;
  slots: RoundSlot[];
  /** The queue's problems of this round, in slot order. */
  problems: { slot: string; problem: UpsolveProblem }[];
  waiting: number;
  /** Solved problems of this round whose re-solve is due. */
  resolving: number;
};

const LETTERS = "ABCDEFGH";
/** A contest name never looks like a contest number, so one key serves both judges. */
const keyOf = (p: { contestId: number | string; index: string }) =>
  `${p.contestId}${p.index}`;
/** Session times are stored in seconds by older records and milliseconds by newer ones. */
const toMs = (t: number) => (t < 1e10 ? t * 1000 : t);

/** The key and name of the contest a queued problem belongs to. */
export const contestOf = (p: UpsolveProblem) => ({
  key: `${judgeOf(p)}:${p.contestId}`,
  title:
    judgeOf(p) === "atcoder"
      ? `AtCoder ${String(p.contestId).toUpperCase()}`
      : `Contest ${p.contestId}`,
});

/**
 * Groups the upsolve queue by where each problem was missed, newest round first.
 * A problem that sat in one of your sessions belongs to the latest such session;
 * everything else is grouped by its contest.
 */
export function buildRounds(
  problems: UpsolveProblem[],
  history: Training[],
  now: number = Date.now(),
): Round[] {
  const stateOf = (p: UpsolveProblem): RoundSlot["state"] =>
    !p.solvedTime ? "open" : isResolveDue(p, now) ? "resolve" : "solved";
  const count = (list: UpsolveProblem[]) => ({
    waiting: list.filter((p) => !p.solvedTime).length,
    resolving: list.filter((p) => isResolveDue(p, now)).length,
  });

  const queue = new Map(problems.map((p) => [keyOf(p), p]));
  const placed = new Set<string>();
  const rounds: Round[] = [];

  for (const session of [...history].sort(
    (a, b) => toMs(b.startTime) - toMs(a.startTime),
  )) {
    const set = (session.problems ?? []).slice(0, LETTERS.length);
    const mine = set.flatMap((p, i) => {
      const problem = queue.get(keyOf(p));
      return problem && !placed.has(problemId(problem))
        ? [{ slot: LETTERS[i], problem }]
        : [];
    });
    if (mine.length === 0) continue;
    const here = new Map(mine.map((m) => [m.slot, m.problem]));
    rounds.push({
      key: `session-${session._id ?? session.startTime}`,
      kind: "session",
      title: `${formatTrainingModeLabel(normalizeTrainingMode(session.trainingMode))} session`,
      when: toMs(session.startTime),
      slots: set.map((p, i) => {
        const problem = here.get(LETTERS[i]);
        return {
          label: LETTERS[i],
          state: problem ? stateOf(problem) : p.solvedTime ? "solved" : "none",
        };
      }),
      problems: mine,
      ...count(mine.map((m) => m.problem)),
    });
    mine.forEach((m) => placed.add(problemId(m.problem)));
  }

  const contests = new Map<string, UpsolveProblem[]>();
  for (const p of problems) {
    if (placed.has(problemId(p))) continue;
    const { key } = contestOf(p);
    contests.set(key, [...(contests.get(key) ?? []), p]);
  }
  for (const [key, list] of contests) {
    list.sort((a, b) =>
      a.index.localeCompare(b.index, "en", { numeric: true }),
    );
    rounds.push({
      key: `contest-${key}`,
      kind: "contest",
      title: contestOf(list[0]).title,
      when: Math.max(
        0,
        ...list.map((p) => (p.createdAt ? Date.parse(p.createdAt) : 0) || 0),
      ),
      slots: list.map((p) => ({ label: p.index, state: stateOf(p) })),
      problems: list.map((problem) => ({ slot: problem.index, problem })),
      ...count(list),
    });
  }

  return rounds.sort((a, b) => b.when - a.when);
}

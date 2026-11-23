import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import type { Training } from "@/types/Training";
import type { UpsolveProblem } from "./UpsolveRow";

/** One tile of a round's problem set. "none" is a problem the queue does not hold. */
export type RoundSlot = { label: string; state: "solved" | "open" | "none" };

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
};

const LETTERS = "ABCDEFGH";
const keyOf = (p: { contestId: number; index: string }) =>
  `${p.contestId}${p.index}`;
/** Session times are stored in seconds by older records and milliseconds by newer ones. */
const toMs = (t: number) => (t < 1e10 ? t * 1000 : t);

/**
 * Groups the upsolve queue by where each problem was missed, newest round first.
 * A problem that sat in one of your sessions belongs to the latest such session;
 * everything else is grouped by its contest.
 */
export function buildRounds(
  problems: UpsolveProblem[],
  history: Training[],
): Round[] {
  const queue = new Map(problems.map((p) => [keyOf(p), p]));
  const placed = new Set<string>();
  const rounds: Round[] = [];

  for (const session of [...history].sort(
    (a, b) => toMs(b.startTime) - toMs(a.startTime),
  )) {
    const set = (session.problems ?? []).slice(0, LETTERS.length);
    const mine = set.flatMap((p, i) => {
      const problem = queue.get(keyOf(p));
      return problem && !placed.has(keyOf(p))
        ? [{ slot: LETTERS[i], problem }]
        : [];
    });
    if (mine.length === 0) continue;
    const here = new Set(mine.map((m) => m.slot));
    rounds.push({
      key: `session-${session._id ?? session.startTime}`,
      kind: "session",
      title: `${formatTrainingModeLabel(normalizeTrainingMode(session.trainingMode))} session`,
      when: toMs(session.startTime),
      slots: set.map((p, i) => ({
        label: LETTERS[i],
        state: here.has(LETTERS[i])
          ? queue.get(keyOf(p))!.solvedTime
            ? "solved"
            : "open"
          : p.solvedTime
            ? "solved"
            : "none",
      })),
      problems: mine,
      waiting: mine.filter((m) => !m.problem.solvedTime).length,
    });
    mine.forEach((m) => placed.add(keyOf(m.problem)));
  }

  const contests = new Map<number, UpsolveProblem[]>();
  for (const p of problems) {
    if (placed.has(keyOf(p))) continue;
    contests.set(p.contestId, [...(contests.get(p.contestId) ?? []), p]);
  }
  for (const [contestId, list] of contests) {
    list.sort((a, b) => a.index.localeCompare(b.index));
    rounds.push({
      key: `contest-${contestId}`,
      kind: "contest",
      title: `Contest ${contestId}`,
      when: Math.max(
        0,
        ...list.map((p) => (p.createdAt ? Date.parse(p.createdAt) : 0) || 0),
      ),
      slots: list.map((p) => ({
        label: p.index,
        state: p.solvedTime ? "solved" : "open",
      })),
      problems: list.map((problem) => ({ slot: problem.index, problem })),
      waiting: list.filter((p) => !p.solvedTime).length,
    });
  }

  return rounds.sort((a, b) => b.when - a.when);
}

import type { TrainingProblem } from "./TrainingProblem";

export type Judge = "codeforces" | "atcoder";

/** A problem of the upsolve queue, as GET /api/upsolve returns it. */
export type UpsolveProblem = Omit<TrainingProblem, "contestId"> & {
  /** A number on Codeforces, a contest name such as "abc300" on AtCoder. */
  contestId: number | string;
  /** Absent on records the API has not touched yet: those are Codeforces. */
  judge?: Judge;
  /** When it joined the queue. */
  createdAt?: string;
  note?: string;
  /** Tried and failed, the next untried problem of a contest, or pasted as a link. */
  source?: "failed" | "unattempted" | "manual";
  /** When a solved problem comes back to be solved again; null for never. */
  resolveDueAt?: string | null;
  /** 1 for the 7-day re-solve, 2 for the 30-day one. */
  resolveStage?: number;
};

export const judgeOf = (p: { judge?: Judge }): Judge => p.judge ?? "codeforces";

/** What the API needs to find one problem. */
export const problemRef = (
  p: Pick<UpsolveProblem, "judge" | "contestId" | "index">,
) => ({
  judge: judgeOf(p),
  contestId: p.contestId,
  index: p.index,
});

/** One string per problem, unique across judges. */
export const problemId = (
  p: Pick<UpsolveProblem, "judge" | "contestId" | "index">,
) => `${judgeOf(p)}:${p.contestId}:${p.index}`;

/** A solved problem whose re-solve date has passed. */
export const isResolveDue = (p: UpsolveProblem, now = Date.now()) =>
  !!p.solvedTime && !!p.resolveDueAt && Date.parse(p.resolveDueAt) <= now;

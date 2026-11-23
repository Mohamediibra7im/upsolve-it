import { CodeforcesProblem } from "./Codeforces";
import type { SpeedStatus } from "@/services/training/speedStatus";

/** The judges a problem can come from. Without one it is a Codeforces problem. */
export type Judge = "codeforces" | "atcoder";

type TrainingProblem = Omit<CodeforcesProblem, "contestId"> & {
  /** A number on Codeforces, a contest name such as "abc300" on AtCoder. */
  contestId: number | string;
  judge?: Judge;
  url: string;
  solvedTime: number | null;
  problemId?: string;
  startedAt?: number | null;
  solvedAt?: number | null;
  timeSpentSeconds?: number | null;
  expectedTimeSeconds?: number | null;
  speedStatus?: SpeedStatus;
  attempts?: number;
  isSolved?: boolean;
};

export type { TrainingProblem };

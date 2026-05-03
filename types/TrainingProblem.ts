import { CodeforcesProblem } from "./Codeforces";
import type { SpeedStatus } from "@/utils/training/speedStatus";

type TrainingProblem = CodeforcesProblem & {
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

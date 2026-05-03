import { TrainingProblem } from "./TrainingProblem";
import type { TrainingMode } from "./TrainingMode";

export interface Training {
  _id?: string;
  /** Server training session id (training-sessions create) */
  serverSessionId?: string;
  startTime: number;
  endTime: number;
  customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
    P5?: number;
    P6?: number;
    P7?: number;
    P8?: number;
  };
  problems: TrainingProblem[];
  performance: number;
  trainingMode?: TrainingMode;
  /** When weakness mode fell back to ladder */
  weaknessFallback?: boolean;
  showRatings?: boolean;
  durationMinutes?: number;
  level?: string;
}

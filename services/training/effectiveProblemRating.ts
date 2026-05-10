import type { Training } from "@/types/Training";
import type { TrainingProblem } from "@/types/TrainingProblem";

const RATING_KEYS = [
  "P1",
  "P2",
  "P3",
  "P4",
  "P5",
  "P6",
  "P7",
  "P8",
] as const;

/** Matches backend `problemRatingAt` in session-performance.ts */
export function effectiveProblemRatingAt(
  problem: TrainingProblem,
  index: number,
  customRatings: Training["customRatings"] | undefined,
): number {
  if (problem.rating != null && problem.rating > 0) return problem.rating;
  const k = RATING_KEYS[index];
  if (k && customRatings && customRatings[k] != null) {
    return customRatings[k]!;
  }
  return 1500;
}

export function averageEffectiveProblemRatingForSession(
  training: Training,
): number {
  const list = training.problems ?? [];
  if (list.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum += effectiveProblemRatingAt(list[i], i, training.customRatings);
  }
  return sum / list.length;
}

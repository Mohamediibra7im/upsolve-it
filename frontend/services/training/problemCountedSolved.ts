import type { Training } from "@/types/Training";
import type { TrainingProblem } from "@/types/TrainingProblem";

/** Align with backend isProblemMarkedSolved for stats / heatmap / UI counts */
export function isTrainingProblemCountedSolved(
  p: TrainingProblem,
): boolean {
  if (p.isSolved === true) return true;
  const t = p.solvedAt ?? p.solvedTime;
  if (t == null) return false;
  if (typeof t === "number") return t > 0 && Number.isFinite(t);
  return true;
}

export function trainingSessionHasSolve(t: Training): boolean {
  return (t.problems ?? []).some((p) => isTrainingProblemCountedSolved(p));
}

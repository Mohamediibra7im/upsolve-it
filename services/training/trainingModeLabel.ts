import type { TrainingMode } from "@/types/TrainingMode";

export const TRAINING_MODE_ORDER: TrainingMode[] = [
  "ladder",
  "weakness",
  "speed",
  "contest",
  "endurance",
];

export function normalizeTrainingMode(
  m: string | undefined | null,
): TrainingMode {
  const x = (m ?? "ladder") as TrainingMode;
  return TRAINING_MODE_ORDER.includes(x) ? x : "ladder";
}

export function formatTrainingModeLabel(mode: TrainingMode): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

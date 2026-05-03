export type TrainingMode =
  | "ladder"
  | "weakness"
  | "speed"
  | "contest"
  | "endurance";

export type ModeConfig = {
  mode: TrainingMode;
  /** Problems count */
  problemCount: number;
  durationMinutes: number;
  showRatings: boolean;
  hideProblemDetailsDuringSession: boolean;
};

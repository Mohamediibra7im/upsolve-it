import type { Training } from "@/types/Training";
import type { TrainingProblem } from "@/types/TrainingProblem";
import { expectedTimeSecondsFromRating } from "./expectedTime";

/** A problem as the API stores it in a session or a room. */
export const problemPayload = (p: TrainingProblem) => ({
  problemId: p.problemId ?? `${p.contestId}_${p.index}`,
  judge: p.judge,
  contestId: p.contestId,
  index: p.index,
  name: p.name,
  rating: p.rating ?? 0,
  tags: p.tags,
  url: p.url,
  startedAt: p.startedAt,
  solvedAt: p.solvedAt,
  timeSpentSeconds: p.timeSpentSeconds,
  expectedTimeSeconds:
    p.expectedTimeSeconds ?? expectedTimeSecondsFromRating(p.rating ?? 0),
  speedStatus: p.speedStatus,
  attempts: p.attempts,
  isSolved: p.isSolved,
  solvedTime: p.solvedTime,
});

/** The body of POST /api/training-sessions for a session about to start. */
export const sessionPayload = (t: Training, tags: string[] = []) => ({
  trainingMode: t.trainingMode,
  level: t.level ?? "",
  tags,
  showRatings: t.showRatings,
  weaknessFallback: t.weaknessFallback ?? false,
  startTime: t.startTime,
  endTime: t.endTime,
  durationMinutes: t.durationMinutes,
  customRatings: t.customRatings,
  problems: t.problems.map(problemPayload),
});

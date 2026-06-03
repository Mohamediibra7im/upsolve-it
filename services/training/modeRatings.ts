import type { TrainingMode } from "@/types/TrainingMode";

const clamp = (r: number) => Math.max(800, Math.min(3500, Math.round(r)));

/** CF-style 100-point bands for ladder targets and derived P1–P4 (admin UI uses the same step). */
export const LADDER_RATING_BAND_STEP = 100;

function roundRatingBand(x: number): number {
  const snapped =
    Math.round(x / LADDER_RATING_BAND_STEP) * LADDER_RATING_BAND_STEP;
  return Math.max(800, Math.min(3500, snapped));
}

/**
 * Four ladder targets around the level's performance rating: problems stay near the
 * target, at least one slot is strictly above it (when below 3500), and the easiest
 * slot is not more than ~300 under target (so high-target sessions avoid very easy fillers).
 * Slots snap to 100-point bands.
 */
export function ladderRatingsFromPerformance(performance: number): {
  P1: number;
  P2: number;
  P3: number;
  P4: number;
} {
  const T = Math.round(performance);
  const roundBand = roundRatingBand;
  let hiEff = Math.min(3500, T + 200);
  const loBase = Math.max(800, T - 300);
  if (hiEff <= T && T < 3500) {
    hiEff = Math.min(3500, T + 100);
  }
  let loEff = loBase;
  if (loEff >= hiEff) {
    loEff = Math.max(800, hiEff - 300);
  }
  const span = hiEff - loEff;
  const out = [0, 1, 2, 3].map((i) => roundBand(loEff + (span * i) / 3));
  for (let i = 1; i < 4; i++) {
    if (out[i] <= out[i - 1]) {
      out[i] = Math.min(3500, out[i - 1] + LADDER_RATING_BAND_STEP);
    }
  }
  if (T < 3500 && out[3] <= T) {
    out[3] = Math.min(3500, roundBand(T + 100));
  }
  for (let i = 2; i >= 0; i--) {
    if (out[i] >= out[i + 1]) {
      out[i] = Math.max(800, out[i + 1] - LADDER_RATING_BAND_STEP);
    }
  }
  return { P1: out[0], P2: out[1], P3: out[2], P4: out[3] };
}

export function buildRatingsForMode(
  mode: TrainingMode,
  userRating: number,
  ladder: { P1: number; P2: number; P3: number; P4: number },
): { ratings: number[]; durationMinutes: number; showRatings: boolean; hideDetails: boolean } {
  const u = userRating || 1500;
  switch (mode) {
    case "ladder":
      return {
        ratings: [ladder.P1, ladder.P2, ladder.P3, ladder.P4],
        durationMinutes: 120,
        showRatings: true,
        hideDetails: false,
      };
    case "weakness":
      return {
        ratings: [ladder.P1, ladder.P2, ladder.P3, ladder.P4],
        durationMinutes: 120,
        showRatings: true,
        hideDetails: false,
      };
    case "speed": {
      const lo = u - 400;
      const hi = u - 100;
      const step = (hi - lo) / 3;
      return {
        ratings: [0, 1, 2, 3].map((i) => clamp(lo + step * i)),
        durationMinutes: 52,
        showRatings: true,
        hideDetails: false,
      };
    }
    case "contest":
      return {
        ratings: [
          clamp(u - 200),
          clamp(u),
          clamp(u + 100),
          clamp(u + 200),
        ],
        durationMinutes: 120,
        showRatings: false,
        hideDetails: true,
      };
    case "endurance": {
      const spread = [-250, -150, -50, 0, 50, 150, 250];
      return {
        ratings: spread.map((d) => clamp(u + d)),
        durationMinutes: 210,
        showRatings: true,
        hideDetails: false,
      };
    }
    default:
      return buildRatingsForMode("ladder", u, ladder);
  }
}

export function customRatingsFromProblems(
  problems: { rating: number }[],
): {
  P1: number;
  P2: number;
  P3: number;
  P4: number;
  P5?: number;
  P6?: number;
  P7?: number;
  P8?: number;
} {
  const keys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"] as const;
  const base = {
    P1: problems[0]?.rating ?? 800,
    P2: problems[1]?.rating ?? 800,
    P3: problems[2]?.rating ?? 800,
    P4: problems[3]?.rating ?? 800,
  };
  const extra: Record<string, number> = {};
  for (let i = 4; i < problems.length; i++) {
    extra[keys[i]] = problems[i].rating;
  }
  return { ...base, ...extra };
}

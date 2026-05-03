import { useMemo } from "react";
import useSWR from "swr";
import { resolveApiUrl } from "@/lib/apiClient";
import { ladderRatingsFromPerformance } from "@/utils/training/modeRatings";

export interface Level {
  id: number;
  level: string;
  time: string;
  Performance: string;
  P1: string;
  P2: string;
  P3: string;
  P4: string;
}

/** SWR key shared with admin level editor for cache invalidation after saves. */
export const TRAINING_LEVELS_SWR_KEY = "training-levels-data";

export type LevelApiRow = Pick<Level, "id" | "level" | "time" | "Performance">;

/** Shared fetcher for SWR (training UI + admin). Levels live only in MongoDB via GET /api/levels. */
export async function fetchTrainingLevelsFromApi(): Promise<LevelApiRow[]> {
  const res = await fetch(resolveApiUrl("/api/levels"), {
    credentials: "omit",
  });
  if (!res.ok) {
    throw new Error(`Levels API error: ${res.status}`);
  }
  const j = (await res.json()) as { levels: LevelApiRow[] };
  if (!Array.isArray(j.levels) || j.levels.length === 0) {
    throw new Error(
      "No training levels in the database. An administrator must insert level data (for example via the API or database migration).",
    );
  }
  return j.levels;
}

export const useLevels = () => {
  const { data, error, isLoading, mutate } = useSWR<LevelApiRow[]>(
    TRAINING_LEVELS_SWR_KEY,
    fetchTrainingLevelsFromApi,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
      shouldRetryOnError: true,
    },
  );

  const levels: Level[] = useMemo(() => {
    if (!data?.length) return [];
    return data.map((level) => {
      const perf = Number.parseInt(level.Performance, 10);
      const r = ladderRatingsFromPerformance(
        Number.isFinite(perf) ? perf : 900,
      );
      return {
        ...level,
        P1: String(r.P1),
        P2: String(r.P2),
        P3: String(r.P3),
        P4: String(r.P4),
      };
    });
  }, [data]);

  const getLevelByPerformance = (performance: number): Level | null => {
    return (
      levels.find((level) => Number.parseInt(level.Performance, 10) >= performance) ||
      null
    );
  };

  const getLevelById = (id: number): Level | null => {
    return levels.find((level) => level.id === id) || null;
  };

  const getDefaultLevel = (): Level | null => {
    return levels.find((level) => level.id === 1) || null;
  };

  return {
    levels,
    isLoading,
    error: error ? String(error instanceof Error ? error.message : error) : null,
    mutateLevels: mutate,
    getLevelByPerformance,
    getLevelById,
    getDefaultLevel,
  };
};

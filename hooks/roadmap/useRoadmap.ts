import useSWR from "swr";
import { swrFetcher, proactiveSwrFetcher } from "@/lib/apiClient";
import type { RoadmapLevel, RoadmapLevelDetail, RoadmapTopicDetail, UserRoadmapSummary, LeaderboardEntry, LeaderboardResponse } from "@/types/Roadmap";

export interface RoadmapActivity {
  problemDates: string[];
  topicDates: string[];
}

export const useRoadmapLevels = () => {
  const { data, error, isLoading, mutate } = useSWR<{ levels: RoadmapLevel[] }>(
    "/api/roadmap/levels",
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    levels: data?.levels ?? [],
    isLoading,
    error: error ? String(error) : null,
    mutateLevels: mutate,
  };
};

export const useRoadmapLevel = (levelId?: string) => {
  const { data, error, isLoading, mutate } = useSWR<RoadmapLevelDetail>(
    levelId ? `/api/roadmap/levels/${levelId}` : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 30_000,
    },
  );

  return {
    data,
    isLoading,
    error: error ? String(error) : null,
    mutate,
  };
};

export const useRoadmapTopic = (levelId?: string, topicId?: string, language?: string) => {
  const langParam = language === "Arabic" || language === "English" ? language : undefined;
  const swrKey =
    levelId && topicId
      ? `/api/roadmap/levels/${levelId}/topics/${topicId}${langParam ? `?language=${langParam}` : ""}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<RoadmapTopicDetail>(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 15_000,
    },
  );

  return {
    data,
    isLoading,
    error: error ? String(error) : null,
    mutate,
  };
};

export const useRoadmapUserSummary = (enabled = true) => {
  const { data, error, isLoading, mutate } = useSWR<UserRoadmapSummary>(
    enabled ? "/api/roadmap/user/summary" : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    summary: data,
    isLoading,
    error: error ? String(error) : null,
    mutateSummary: mutate,
  };
};

export const useRoadmapLeaderboard = (query?: {
  level?: string;
  period?: string;
  limit?: number;
  page?: number;
}) => {
  const cleanQuery: Record<string, string> = {};
  if (query) {
    Object.entries(query).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        cleanQuery[key] = String(val);
      }
    });
  }
  const queryString = new URLSearchParams(cleanQuery).toString();
  const url = queryString ? `/api/roadmap/leaderboard?${queryString}` : "/api/roadmap/leaderboard";

  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    url,
    proactiveSwrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    leaderboard: (data?.leaderboard ?? []) as LeaderboardEntry[],
    top3: (data?.top3 ?? []) as LeaderboardEntry[],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? 20,
    totalPages: data?.totalPages ?? 0,
    myRank: data?.myRank ?? null,
    isLoading,
    error: error ? String(error) : null,
    mutateLeaderboard: mutate,
  };
};

export const useRoadmapActivity = (enabled = true) => {
  const { data, error, isLoading } = useSWR<RoadmapActivity>(
    enabled ? "/api/roadmap/user/activity" : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    activity: data ?? { problemDates: [], topicDates: [] },
    isLoading,
    error: error ? String(error) : null,
  };
};

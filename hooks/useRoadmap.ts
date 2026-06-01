import { useEffect, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import type { RoadmapLevel, RoadmapLevelDetail, RoadmapTopicDetail, UserRoadmapSummary, LeaderboardEntry } from "@/types/Roadmap";

const ROADMAP_LEVELS_KEY = "roadmap-levels";

export const useRoadmapLevels = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading, mutate } = useSWR<{ levels: RoadmapLevel[] }>(
    isClient ? "/api/roadmap/levels" : null,
    swrFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 60_000,
    },
  );

  return {
    levels: data?.levels ?? [],
    isLoading: !isClient || isLoading,
    error: error ? String(error) : null,
    mutateLevels: mutate,
  };
};

export const useRoadmapLevel = (levelId?: string) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading, mutate } = useSWR<RoadmapLevelDetail>(
    isClient && levelId ? `/api/roadmap/levels/${levelId}` : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
    },
  );

  return {
    data,
    isLoading: !isClient || isLoading,
    error: error ? String(error) : null,
    mutate,
  };
};

export const useRoadmapTopic = (levelId?: string, topicId?: string) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading, mutate } = useSWR<RoadmapTopicDetail>(
    isClient && levelId && topicId
      ? `/api/roadmap/levels/${levelId}/topics/${topicId}`
      : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
    },
  );

  return {
    data,
    isLoading: !isClient || isLoading,
    error: error ? String(error) : null,
    mutate,
  };
};

export const useRoadmapUserSummary = (enabled = true) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, error, isLoading, mutate } = useSWR<UserRoadmapSummary>(
    isClient && enabled ? "/api/roadmap/user/summary" : null,
    swrFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 15_000,
    },
  );

  return {
    summary: data,
    isLoading: !isClient || isLoading,
    error: error ? String(error) : null,
    mutateSummary: mutate,
  };
};

export const useRoadmapLeaderboard = (query?: { level?: string; period?: string }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const { data, error, isLoading, mutate } = useSWR<any>(
    isClient ? url : null,
    swrFetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 30_000,
    },
  );

  return {
    leaderboard: (Array.isArray(data) ? data : (data?.leaderboard ?? [])) as LeaderboardEntry[],
    isLoading: !isClient || isLoading,
    error: error ? String(error) : null,
    mutateLeaderboard: mutate,
  };
};

import { apiFetcher } from "@/lib/apiClient";
import useSWR from "swr";

export interface AdminStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  recentlyJoinedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  activeUsers: number;
  averageRating: number;
  totalTrainings: number;
  completedTrainings: number;
  activeTrainings: number;
  abandonedTrainings: number;
  totalTrainingProblems: number;
  solvedTrainingProblems: number;
  solvingRate: number;
  averagePerformance: number;
  bestPerformance: number;
  totalUpsolvedProblems: number;
  completedUpsolves: number;
  upsolveSolveRate: number;
  totalLevels: number;
  totalXpEarned: number;
  totalLevelsCompleted: number;
  totalTopicsCompleted: number;
  ratingBands: Array<{
    label: string;
    count: number;
  }>;
  trainingModes: Array<{
    mode: string;
    label: string;
    sessions: number;
    solved: number;
  }>;
  activityTrend: Array<{
    date: string;
    label: string;
    users: number;
    sessions: number;
    upsolves: number;
  }>;
}

const defaultStats: AdminStats = {
  totalUsers: 0,
  adminUsers: 0,
  regularUsers: 0,
  recentlyJoinedUsers: 0,
  verifiedUsers: 0,
  unverifiedUsers: 0,
  activeUsers: 0,
  averageRating: 0,
  totalTrainings: 0,
  completedTrainings: 0,
  activeTrainings: 0,
  abandonedTrainings: 0,
  totalTrainingProblems: 0,
  solvedTrainingProblems: 0,
  solvingRate: 0,
  averagePerformance: 0,
  bestPerformance: 0,
  totalUpsolvedProblems: 0,
  completedUpsolves: 0,
  upsolveSolveRate: 0,
  totalLevels: 0,
  totalXpEarned: 0,
  totalLevelsCompleted: 0,
  totalTopicsCompleted: 0,
  ratingBands: [
    { label: "<1200", count: 0 },
    { label: "1200-1399", count: 0 },
    { label: "1400-1599", count: 0 },
    { label: "1600-1899", count: 0 },
    { label: "1900-2099", count: 0 },
    { label: "2100-2399", count: 0 },
    { label: "2400+", count: 0 },
  ],
  trainingModes: [
    { mode: "ladder", label: "Ladder", sessions: 0, solved: 0 },
    { mode: "weakness", label: "Weakness", sessions: 0, solved: 0 },
    { mode: "speed", label: "Speed", sessions: 0, solved: 0 },
    { mode: "contest", label: "Contest", sessions: 0, solved: 0 },
    { mode: "endurance", label: "Endurance", sessions: 0, solved: 0 },
  ],
  activityTrend: [],
};

const fetcher = (url: string) => apiFetcher<AdminStats>(url);

export function useAdminStats() {
  const { data, error, mutate } = useSWR<AdminStats>(
    "/api/admin/stats",
    fetcher,
    {
      // Optimize for dashboard
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      refreshInterval: 120000, // 2 minutes
    },
  );

  return {
    stats: data || defaultStats,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

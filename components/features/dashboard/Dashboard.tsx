"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@/hooks/auth";
import { useFriendRequests } from "@/hooks/social";
import { useHistory } from "@/hooks/data";
import { useUpsolvedProblems } from "@/hooks/data";
import { useHeatmapData } from "@/hooks/data";
import { useRoadmapUserSummary, useRoadmapLeaderboard, useRoadmapActivity } from "@/hooks/roadmap";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";

import DashboardHero from "./DashboardHero";
import DashboardStatCards, { buildDashboardStats } from "./DashboardStatCards";
import DashboardStreaks from "./DashboardStreaks";
import DashboardSidebar from "./DashboardSidebar";

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function Dashboard() {
  const { user, logout: _logout, syncProfile } = useUser();
  const { incoming: incomingFriendRequests } = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const { history, isLoading: isHistoryLoading, error: historyError, refresh: refreshHistory } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading, error: upsolveError, refreshUpsolvedProblems } = useUpsolvedProblems();
  const [isSyncing, setIsSyncing] = useState(false);

  const { summary, error: summaryError, mutateSummary } = useRoadmapUserSummary(!!user);
  const { leaderboard } = useRoadmapLeaderboard({ limit: 5 });
  const { activity: roadmapActivity } = useRoadmapActivity(!!user);
  const { totalSolved } = useHeatmapData(history || [], upsolvedProblems || [], roadmapActivity);

  const { data: streaks } = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try { await syncProfile(); } finally { setIsSyncing(false); }
  };

  // Guard: user must exist (AuthGuard in layout already ensures this,
  // but handle the edge case gracefully)
  if (!user) return null;

  // XP and rank derived from roadmap summary (loads async — show 0 until ready)
  const roadmapXp = summary?.totalXp ?? 0;
  const roadmapProblemsSolved = summary?.problemsSolved ?? 0;
  const roadmapTopicsCompleted = summary?.topicsCompleted ?? 0;
  const myRank = leaderboard?.find((e) => String(e.userId) === String(user._id));
  const roadmapRank = myRank?.rank ?? 0;

  // XP level calculation
  const xpLevel = Math.floor(roadmapXp / 500) + 1;
  const xpProgress = ((roadmapXp % 500) / 500) * 100;
  const xpToNext = 500 - (roadmapXp % 500);

  const xpTitle =
    roadmapXp > 5000
      ? "Legend"
      : roadmapXp > 3000
        ? "Champion"
        : roadmapXp > 1500
          ? "Strategist"
          : roadmapXp > 500
            ? "Tactician"
            : "Novice";

  // Secondary data loading — history and upsolve can still be arriving;
  // pass empty arrays so stat cards render instantly with whatever is cached.
  const stats = buildDashboardStats({
    user,
    totalSolved,
    roadmapProblemsSolved,
    historyLength: history?.length || 0,
    roadmapTopicsCompleted,
  });

  const secondaryLoading = isHistoryLoading || isUpsolveLoading;

  return (
    <div className="space-y-5">
      {/* Hero renders immediately — no dependency on history/upsolve */}
      <DashboardHero
        user={user}
        roadmapXp={roadmapXp}
        xpLevel={xpLevel}
        xpProgress={xpProgress}
        xpToNext={xpToNext}
        xpTitle={xpTitle}
        friendRequestCount={friendRequestCount}
        isSyncing={isSyncing}
        onSync={handleSync}
      />

      {(historyError || upsolveError || summaryError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Some progress is unavailable. Try again to see your latest statistics.</p><Button variant="outline" onClick={() => Promise.all([refreshHistory(), refreshUpsolvedProblems(), mutateSummary()])}>Try again</Button></div>}

      {/* Stat cards — shows 0s while secondary data loads, fills in quickly */}
      <DashboardStatCards stats={stats} />

      <DashboardStreaks streaks={streaks} roadmapRank={roadmapRank} />

      {/* Show matching placeholders while secondary data loads. */}
      {secondaryLoading ? (
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading your progress">
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none md:col-span-2 xl:col-span-1" />
        </div>
      ) : (
        <DashboardSidebar
          user={user}
          roadmapXp={roadmapXp}
          roadmapProblemsSolved={roadmapProblemsSolved}
          summary={summary}
          leaderboard={leaderboard}
        />
      )}
    </div>
  );
}


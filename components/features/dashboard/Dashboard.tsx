"use client";

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
import DashboardHeatmap from "./DashboardHeatmap";
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
  const { history, isLoading: isHistoryLoading } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading } = useUpsolvedProblems();
  const [isSyncing, setIsSyncing] = useState(false);

  const { summary } = useRoadmapUserSummary(!!user);
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
    await syncProfile();
    setIsSyncing(false);
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
    <div className="space-y-10">
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

      {/* Stat cards — shows 0s while secondary data loads, fills in quickly */}
      <DashboardStatCards stats={stats} />

      <DashboardStreaks streaks={streaks} roadmapRank={roadmapRank} />

      {/* Heatmap + Sidebar — show skeleton while history/upsolve are loading */}
      {secondaryLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-[2rem] border border-border/40 bg-card/30 h-48 animate-pulse" />
          <div className="rounded-[2rem] border border-border/40 bg-card/30 h-48 animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DashboardHeatmap
            history={history || []}
            upsolvedProblems={upsolvedProblems || []}
            roadmapActivity={roadmapActivity}
          />
          <DashboardSidebar
            user={user}
            roadmapXp={roadmapXp}
            roadmapProblemsSolved={roadmapProblemsSolved}
            summary={summary}
            leaderboard={leaderboard}
          />
        </div>
      )}
    </div>
  );
}

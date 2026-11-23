"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@/hooks/auth";
import { useFriendRequests } from "@/hooks/social";
import { useHistory } from "@/hooks/data";
import { useUpsolvedProblems } from "@/hooks/data";
import { useHeatmapData } from "@/hooks/data";
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

  const { totalSolved } = useHeatmapData(history || [], upsolvedProblems || []);
  const pendingUpsolves = (upsolvedProblems || []).filter((p) => !p.solvedTime);
  const upsolveTotal = upsolvedProblems?.length ?? 0;
  const upsolveSolved = upsolveTotal - pendingUpsolves.length;

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

  // Secondary data loading — history and upsolve can still be arriving;
  // pass empty arrays so stat cards render instantly with whatever is cached.
  const stats = buildDashboardStats({
    user,
    totalSolved,
    upsolveSolved,
    historyLength: history?.length || 0,
    upsolvePending: pendingUpsolves.length,
  });

  const secondaryLoading = isHistoryLoading || isUpsolveLoading;

  return (
    <div className="space-y-5">
      {/* Hero renders immediately — no dependency on history/upsolve */}
      <DashboardHero
        user={user}
        upsolvePending={pendingUpsolves.length}
        upsolveSolved={upsolveSolved}
        upsolveTotal={upsolveTotal}
        friendRequestCount={friendRequestCount}
        isSyncing={isSyncing}
        onSync={handleSync}
      />

      {(historyError || upsolveError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Some progress is unavailable. Try again to see your latest statistics.</p><Button variant="outline" onClick={() => Promise.all([refreshHistory(), refreshUpsolvedProblems()])}>Try again</Button></div>}

      {/* Stat cards — shows 0s while secondary data loads, fills in quickly */}
      <DashboardStatCards stats={stats} />

      <DashboardStreaks streaks={streaks} />

      {/* Show matching placeholders while secondary data loads. */}
      {secondaryLoading ? (
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2" role="status" aria-label="Loading your progress">
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
          <div className="h-80 animate-pulse rounded-3xl border border-border bg-card motion-reduce:animate-none" />
        </div>
      ) : (
        <DashboardSidebar
          user={user}
          pendingUpsolves={pendingUpsolves}
        />
      )}
    </div>
  );
}


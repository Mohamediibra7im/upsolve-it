"use client";

import {useState} from "react";
import {useUser} from "@/hooks/auth";
import {useFriendRequests} from "@/hooks/social";
import Loader from "@/components/shared/Loader";
import {useHistory} from "@/hooks/data";
import {useUpsolvedProblems} from "@/hooks/data";
import {useHeatmapData} from "@/hooks/data";
import {useRoadmapUserSummary, useRoadmapLeaderboard, useRoadmapActivity} from "@/hooks/roadmap";
import useSWR from "swr";
import {swrFetcher} from "@/lib/apiClient";

import DashboardHero from "./DashboardHero";
import DashboardStatCards, {buildDashboardStats} from "./DashboardStatCards";
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
  const {user, isLoading: isUserLoading, logout: _logout, syncProfile} = useUser();
  const {incoming: incomingFriendRequests} = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const {history, isLoading: isHistoryLoading} = useHistory();
  const {upsolvedProblems, isLoading: isUpsolveLoading} = useUpsolvedProblems();
  const [isSyncing, setIsSyncing] = useState(false);

  const {summary} = useRoadmapUserSummary(!!user);
  const {leaderboard} = useRoadmapLeaderboard({ limit: 5 });
  const {activity: roadmapActivity} = useRoadmapActivity(!!user);
  const {totalSolved} = useHeatmapData(history || [], upsolvedProblems || [], roadmapActivity);

  const {data: streaks} = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    {revalidateOnFocus: false},
  );

  const handleSync = async () => {
    setIsSyncing(true);
    await syncProfile();
    setIsSyncing(false);
  };

  // Find user rank on the leaderboard
  const myRank = leaderboard?.find(
    (entry) => String(entry.userId) === String(user?._id),
  );

  if (isUserLoading || isHistoryLoading || isUpsolveLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (!user) return null;

  const roadmapXp = summary?.totalXp ?? 0;
  const roadmapRank = myRank?.rank ?? 0;
  const roadmapProblemsSolved = summary?.problemsSolved ?? 0;
  const roadmapTopicsCompleted = summary?.topicsCompleted ?? 0;

  // XP level calculation
  const xpLevel = Math.floor(roadmapXp / 500) + 1;
  const xpProgress = ((roadmapXp % 500) / 500) * 100;
  const xpToNext = 500 - (roadmapXp % 500);

  // Dynamic title based on XP
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

  const stats = buildDashboardStats({
    user,
    totalSolved,
    roadmapProblemsSolved,
    historyLength: history?.length || 0,
    roadmapTopicsCompleted,
  });

  return (
    <div className="space-y-10">
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

      <DashboardStatCards stats={stats} />

      <DashboardStreaks streaks={streaks} roadmapRank={roadmapRank} />

      {/* ─── MAIN CONTENT: HEATMAP + SIDEBAR ─── */}
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
    </div>
  );
}

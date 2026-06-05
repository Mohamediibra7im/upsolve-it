"use client";

import { Trophy, Crown, Flame, Award, Target, Zap, CheckCircle } from "lucide-react";
import { useUser } from "@/hooks/auth";
import { useRoadmapUserSummary } from "@/hooks/roadmap";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import Loader from "@/components/shared/Loader";
import { useMemo } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import { isTrainingProblemCountedSolved, trainingSessionHasSolve } from "@/services/training/problemCountedSolved";
import { ProfileHeader, SidebarCards, StatsGrid } from "@/components/features/profile";

const getCFMilestone = (rating: number) => {
  if (rating < 1200)
    return { name: "Pupil", target: 1200, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20", band: "0 - 1199" };
  if (rating < 1400)
    return { name: "Specialist", target: 1400, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20", band: "1200 - 1399" };
  if (rating < 1600)
    return { name: "Expert", target: 1600, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", band: "1400 - 1599" };
  if (rating < 1900)
    return { name: "Candidate Master", target: 1900, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20", band: "1600 - 1899" };
  if (rating < 2100)
    return { name: "Master", target: 2100, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", band: "1900 - 2099" };
  if (rating < 2300)
    return { name: "International Master", target: 2300, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", band: "2100 - 2299" };
  if (rating < 2400)
    return { name: "Grandmaster", target: 2400, color: "text-red-500 font-bold", bg: "bg-red-600/10", border: "border-red-600/20", band: "2300 - 2399" };
  return { name: "Legendary Grandmaster", target: 3000, color: "text-red-600 font-extrabold", bg: "bg-red-700/10", border: "border-red-700/20", band: "2400+" };
};

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function ProfilePage() {
  const { user, isLoading, syncProfile, logout } = useUser();
  const { summary, isLoading: isSummaryLoading } = useRoadmapUserSummary(!!user);
  const { history } = useHistory();
  const { upsolvedProblems: _upsolvedProblems } = useUpsolvedProblems();
  const { data: streaks } = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const trainingStats = useMemo(() => {
    if (!history || history.length === 0) return null;
    const totalSessions = history.length;
    const totalProblems = history.reduce((acc, s) => acc + s.problems.length, 0);
    const solvedProblems = history.reduce(
      (acc, s) => acc + s.problems.filter(isTrainingProblemCountedSolved).length,
      0,
    );
    const sessionsWithSolve = history.filter(trainingSessionHasSolve);
    const avgPerformance =
      sessionsWithSolve.length > 0
        ? Math.round(
            sessionsWithSolve.reduce((acc, s) => acc + (s.performance ?? 0), 0) /
              sessionsWithSolve.length,
          )
        : null;
    const bestPerformance =
      sessionsWithSolve.length > 0
        ? Math.max(...sessionsWithSolve.map((s) => s.performance ?? 0))
        : null;
    const solvingRate =
      totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
    return { totalSessions, totalProblems, solvedProblems, avgPerformance, bestPerformance, solvingRate };
  }, [history]);

  const recentSessions = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => b.startTime - a.startTime).slice(0, 5);
  }, [history]);

  if (isLoading || (user && isSummaryLoading)) {
    return <Loader message="Loading profile..." />;
  }

  if (!user) return null;

  const rating = user.rating || 0;
  const milestone = getCFMilestone(rating);

  const currentTierStart =
    rating < 1200 ? 0 : rating < 1400 ? 1200 : rating < 1600 ? 1400 : rating < 1900 ? 1600 : rating < 2100 ? 1900 : rating < 2300 ? 2100 : 2300;

  const ratingDiff = milestone.target - rating;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((rating - currentTierStart) / (milestone.target - currentTierStart)) * 100),
  );

  const profileStats = [
    { label: "Current Rating", value: user.rating || 0, sub: user.rank || "Unrated", icon: Trophy, tone: "text-amber-500" },
    { label: "Max Rating", value: user.maxRating || 0, sub: user.maxRank || "Unrated", icon: Crown, tone: "text-emerald-500" },
    { label: "Roadmap XP", value: summary?.totalXp?.toLocaleString() || 0, sub: "All time XP", icon: Flame, tone: "text-orange-500" },
    { label: "Problems Solved", value: summary?.problemsSolved || 0, sub: "Manual checklists", icon: Award, tone: "text-cyan-500" },
    { label: "Topics Completed", value: summary?.topicsCompleted || 0, sub: "Skills unlocked", icon: Target, tone: "text-purple-500" },
  ];

  const upsolvedSolvedCount = _upsolvedProblems.filter(
    (p) => p.solvedTime !== null && p.solvedTime !== undefined,
  ).length;

  const achievements = [
    {
      id: "gladiator",
      name: "Gladiator",
      desc: "Cleared 5+ Arena training runs",
      icon: Trophy,
      unlocked: (trainingStats?.totalSessions ?? 0) >= 5,
      color: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    },
    {
      id: "marksman",
      name: "Marksman",
      desc: "Maintained a 70%+ solving accuracy",
      icon: Target,
      unlocked: (trainingStats?.solvingRate ?? 0) >= 70,
      color: "text-primary border-primary/20 bg-primary/5",
    },
    {
      id: "upsolve-elite",
      name: "Upsolve Elite",
      desc: "Successfully upsolved a target task",
      icon: CheckCircle,
      unlocked: upsolvedSolvedCount >= 1,
      color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    },
    {
      id: "titan",
      name: "Performance Titan",
      desc: "Avg session score exceeds 1200",
      icon: Zap,
      unlocked: (trainingStats?.avgPerformance ?? 0) >= 1200,
      color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
    },
  ];

  return (
    <div className="min-h-screen pb-20 pt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
        <ProfileHeader user={user} summary={summary} syncProfile={syncProfile} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <SidebarCards
            user={user}
            milestone={milestone}
            rating={rating}
            progressPercent={progressPercent}
            ratingDiff={ratingDiff}
            streaks={streaks ?? null}
            logout={logout}
          />
          <StatsGrid
            profileStats={profileStats}
            trainingStats={trainingStats}
            recentSessions={recentSessions}
            achievements={achievements}
          />
        </div>
      </div>
    </div>
  );
}

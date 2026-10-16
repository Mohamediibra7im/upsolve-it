"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import { Trophy, Crown, Flame, Award, Target, Zap, CheckCircle, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/auth";
import { useRoadmapUserSummary } from "@/hooks/roadmap";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import { isTrainingProblemCountedSolved, trainingSessionHasSolve } from "@/services/training/problemCountedSolved";
import {
  ProfileHeader,
  ConsoleAccountCard,
  MilestoneProgressCard,
  StreaksCard,
  ProfileStatsGrid,
  TrainingStatsGrid,
  AchievementsPanel,
  ActivityLogsPanel
} from "@/components/features/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getCFMilestone = (rating: number) => {
  if (rating < 1200)
    return { name: "Pupil", target: 1200, color: "text-green-500", bg: "bg-primary/10", border: "border-primary/20", band: "0 - 1199" };
  if (rating < 1400)
    return { name: "Specialist", target: 1400, color: "text-cyan-500", bg: "bg-primary/10", border: "border-primary/20", band: "1200 - 1399" };
  if (rating < 1600)
    return { name: "Expert", target: 1600, color: "text-blue-500", bg: "bg-primary/10", border: "border-primary/20", band: "1400 - 1599" };
  if (rating < 1900)
    return { name: "Candidate Master", target: 1900, color: "text-purple-500", bg: "bg-primary/10", border: "border-primary/20", band: "1600 - 1899" };
  if (rating < 2100)
    return { name: "Master", target: 2100, color: "text-orange-500", bg: "bg-primary/10", border: "border-primary/20", band: "1900 - 2099" };
  if (rating < 2300)
    return { name: "International Master", target: 2300, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", band: "2100 - 2299" };
  if (rating < 2400)
    return { name: "Grandmaster", target: 2400, color: "text-red-500 font-medium", bg: "bg-red-600/10", border: "border-red-600/20", band: "2300 - 2399" };
  return { name: "Legendary Grandmaster", target: 3000, color: "text-red-600 font-semibold", bg: "bg-red-700/10", border: "border-red-700/20", band: "2400+" };
};

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function ProfilePage() {
  const { user, isLoading, syncProfile, logout } = useUser();
  const { summary, isLoading: isSummaryLoading, error: summaryError, mutateSummary } = useRoadmapUserSummary(!!user);
  const { history, error: historyError, refresh: refreshHistory } = useHistory();
  const { upsolvedProblems: _upsolvedProblems } = useUpsolvedProblems();
  const { data: streaks } = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const [activeDir, setActiveDir] = useState<"overview" | "achievements" | "logs" | "security">("overview");

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
    return <MemberPageState kind="loading" title="Opening your profile" description="Gathering your practice and roadmap progress." />;
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
    { label: "Current rating", value: user.rating || 0, sub: user.rank || "Unrated", icon: Trophy, tone: "text-foreground" },
    { label: "Best rating", value: user.maxRating || 0, sub: user.maxRank || "Unrated", icon: Crown, tone: "text-primary" },
    { label: "Roadmap XP", value: summary?.totalXp?.toLocaleString() || 0, sub: "All time XP", icon: Flame, tone: "text-primary" },
    { label: "Problems solved", value: summary?.problemsSolved || 0, sub: "Roadmap practice", icon: Award, tone: "text-foreground" },
    { label: "Topics completed", value: summary?.topicsCompleted || 0, sub: "Skills unlocked", icon: Target, tone: "text-foreground" },
  ];

  const upsolvedSolvedCount = _upsolvedProblems.filter(
    (p) => p.solvedTime !== null && p.solvedTime !== undefined,
  ).length;

  const achievements = [
    {
      id: "gladiator",
      name: "Gladiator",
      desc: "Complete 5 training sessions",
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
      color: "text-primary border-border bg-primary/10",
    },
    {
      id: "titan",
      name: "Performance Titan",
      desc: "Avg session score exceeds 1200",
      icon: Zap,
      unlocked: (trainingStats?.avgPerformance ?? 0) >= 1200,
      color: "text-primary border-primary/20 bg-primary/10",
    },
    {
      id: "rating-master",
      name: "Rating milestone",
      desc: "Reached a Codeforces rating of 1900+",
      icon: Crown,
      unlocked: rating >= 1900,
      color: "text-primary border-primary/20 bg-primary/10",
    },
    {
      id: "consistency-core",
      name: "Steady progress",
      desc: "Reach 80% consistency",
      icon: Flame,
      unlocked: (streaks?.consistencyScore ?? 0) >= 80,
      color: "text-primary border-primary/20 bg-primary/10",
    },
    {
      id: "topic-crusher",
      name: "Topic explorer",
      desc: "Complete 5 roadmap topics",
      icon: Award,
      unlocked: (summary?.topicsCompleted ?? 0) >= 5,
      color: "text-primary border-primary/20 bg-primary/10",
    },
    {
      id: "xp-overlord",
      name: "Dedicated learner",
      desc: "Earn 5,000 roadmap XP",
      icon: Sparkles,
      unlocked: (summary?.totalXp ?? 0) >= 5000,
      color: "text-primary border-primary/20 bg-primary/10",
    },
  ];

  const directories = [
    { id: "overview", label: "Overview", path: "Your profile" },
    { id: "achievements", label: "Achievements", path: "Achievements" },
    { id: "logs", label: "Activity", path: "Practice history" },
    { id: "security", label: "Account", path: "Account settings" },
  ] as const;

  return (
    <div className="min-h-screen pb-20 pt-0 font-sans text-foreground">
      <div className="mx-auto w-full space-y-6 max-w-7xl">

        {/* Profile Status Identity Header */}
        <ProfileHeader user={user} summary={summary} syncProfile={syncProfile} />
        {(summaryError || historyError) && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5"><div><p className="text-sm font-medium text-foreground">Some progress is unavailable</p><p className="mt-1 text-sm text-muted-foreground">Try again to bring your latest statistics into view.</p></div><Button variant="outline" onClick={() => Promise.all([mutateSummary(), refreshHistory()])}>Try again</Button></div>}


        <div className="relative overflow-hidden rounded-2xl border border-border bg-background">

          <div className="flex border-b border-border bg-background divide-x divide-border overflow-x-auto">
            {directories.map((dir) => {
              const active = dir.id === activeDir;
              return (
                <button
                  key={dir.id}
                  onClick={() => setActiveDir(dir.id)}
                  aria-pressed={active}
                  className={`flex-1 min-w-[112px] px-4 py-4 text-center font-medium text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                    active
                      ? "bg-card text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                   {dir.label}
                </button>
              );
            })}
          </div>

          {/* Active Viewport Screen Content */}
          <div className="p-4 sm:p-6 relative z-10 min-h-[380px] bg-background">
            {activeDir === "overview" && (
              <div className="space-y-6">
                {/* Profile Stats Row (Rating / XP / Solved) */}
                <ProfileStatsGrid profileStats={profileStats} />

                {/* Sub layout for metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* Left Column: Identity Registry */}
                  <div className="lg:col-span-4 space-y-6">

                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          About you
                        </span>
                        <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-lg border border-border bg-card">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg border border-border p-0.5 bg-card">
                          <Avatar className="size-12 rounded-lg border border-border bg-background">
                            <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                            <AvatarFallback className="bg-card text-primary text-sm font-semibold">
                              {user.codeforcesHandle?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-foreground leading-none truncate">
                            {user.codeforcesHandle}
                          </h4>
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            {user.organization || "Independent Dev"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3 font-sans">
                        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-0.5">
                          <span>Account ID</span>
                          <span className="text-primary">#{user._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-0.5">
                          <span>Current level</span>
                          <span className="text-foreground">{summary?.currentLevel?.title || "Novice"}</span>
                        </div>
                        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-0.5">
                          <span>Role</span>
                          <span className="text-primary">{user.role}</span>
                        </div>
                      </div>
                    </div>

                    {/* Streaks Widget */}
                    <StreaksCard streaks={streaks ?? null} />
                  </div>

                  {/* Right Column: Training Performance & Milestones */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Training Stats Block */}
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground block">
                        Training performance
                      </span>
                      <TrainingStatsGrid trainingStats={trainingStats} />
                    </div>

                    {/* Milestone Progress */}
                    <MilestoneProgressCard
                      user={user}
                      milestone={milestone}
                      rating={rating}
                      progressPercent={progressPercent}
                      ratingDiff={ratingDiff}
                    />
                  </div>

                </div>
              </div>
            )}

            {activeDir === "achievements" && (
              <div className="space-y-4">
                <AchievementsPanel achievements={achievements} />
              </div>
            )}

            {activeDir === "logs" && (
              <div className="space-y-4">
                <ActivityLogsPanel recentSessions={recentSessions} />
              </div>
            )}

            {activeDir === "security" && (
              <div className="max-w-2xl mx-auto space-y-4">
                <ConsoleAccountCard user={user} logout={logout} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

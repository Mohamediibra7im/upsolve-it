"use client";

import { Trophy, Crown, Flame, Award, Target, Zap, CheckCircle, Terminal, Cpu, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/auth";
import { useRoadmapUserSummary } from "@/hooks/roadmap";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import Loader from "@/components/shared/Loader";
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
    {
      id: "rating-master",
      name: "Master Sentinel",
      desc: "Reached Master rank on CF (1900+)",
      icon: Crown,
      unlocked: rating >= 1900,
      color: "text-purple-400 border-purple-400/20 bg-purple-400/5",
    },
    {
      id: "consistency-core",
      name: "Consistency Core",
      desc: "Consistency telemetry reaches 80%+",
      icon: Flame,
      unlocked: (streaks?.consistencyScore ?? 0) >= 80,
      color: "text-orange-400 border-orange-400/20 bg-orange-400/5",
    },
    {
      id: "topic-crusher",
      name: "Database Crusher",
      desc: "Decrypted 5+ roadmap topics",
      icon: Award,
      unlocked: (summary?.topicsCompleted ?? 0) >= 5,
      color: "text-rose-400 border-rose-400/20 bg-rose-400/5",
    },
    {
      id: "xp-overlord",
      name: "XP Overlord",
      desc: "Harvested 5,000+ total Roadmap XP",
      icon: Sparkles,
      unlocked: (summary?.totalXp ?? 0) >= 5000,
      color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
    },
  ];

  const directories = [
    { id: "overview", label: "01. OVERVIEW.SH", path: "~/profile" },
    { id: "achievements", label: "02. ACHIEVEMENTS.SYS", path: "~/achievements" },
    { id: "logs", label: "03. AUDIT_LOGS.TXT", path: "~/activity_logs" },
    { id: "security", label: "04. ACCESS_CONTROL.CFG", path: "~/security" },
  ] as const;

  return (
    <div className="min-h-screen pb-20 pt-0 font-mono text-emerald-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 max-w-7xl">
        
        {/* Profile Status Identity Header */}
        <ProfileHeader user={user} summary={summary} syncProfile={syncProfile} />

        {/* Unified Terminal Cockpit Frame */}
        <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-[#040706] shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
          
          {/* Cockpit Shell Top Status Header */}
          <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
            <div className="flex items-center gap-2">
              <Terminal size={12} className="text-emerald-400 animate-pulse" />
              <span>TERMINAL WORKSTATION // PORT_3000</span>
            </div>
            <div className="flex items-center gap-6">
              <span>DIR: {directories.find(d => d.id === activeDir)?.path}</span>
              <span className="hidden sm:inline">XP_DEC: {summary?.totalXp?.toLocaleString() || 0}</span>
              <span className="inline-flex items-center gap-1">
                <Cpu size={10} className="animate-spin duration-3000" /> STATUS_ACTIVE
              </span>
            </div>
          </div>

          {/* Interactive Diagnostic Directory Tabs Navigation */}
          <div className="flex border-b border-emerald-500/15 bg-[#050907] divide-x divide-emerald-500/15 overflow-x-auto select-none">
            {directories.map((dir) => {
              const active = dir.id === activeDir;
              return (
                <button
                  key={dir.id}
                  onClick={() => setActiveDir(dir.id)}
                  className={`flex-1 min-w-[140px] px-6 py-3.5 text-center font-bold tracking-widest text-[9px] uppercase transition-all duration-200 outline-none hover:bg-emerald-950/15 ${
                    active
                      ? "bg-emerald-950/30 text-emerald-300 border-b-2 border-emerald-400 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] glow-text-emerald"
                      : "text-emerald-500/50 hover:text-emerald-400"
                  }`}
                >
                  [ {dir.label} ]
                </button>
              );
            })}
          </div>

          {/* Active Viewport Screen Content */}
          <div className="p-6 relative z-10 min-h-[380px] bg-[#040706]/95">
            {activeDir === "overview" && (
              <div className="space-y-6">
                {/* Profile Stats Row (Rating / XP / Solved) */}
                <ProfileStatsGrid profileStats={profileStats} />

                {/* Sub layout for metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Identity Registry */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Identity Telemetry Card */}
                    <div className="relative overflow-hidden rounded-xl border border-emerald-500/15 bg-[#060a08]/60 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/40">
                          Identity Telemetry
                        </span>
                        <span className="text-[8px] font-bold text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 bg-emerald-950/35">
                          ACTIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded border border-emerald-500/25 p-0.5 bg-[#0b120f]">
                          <Avatar className="size-12 rounded border border-emerald-500/10 bg-black">
                            <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                            <AvatarFallback className="bg-[#0b120f] text-emerald-400 text-sm font-black">
                              {user.codeforcesHandle?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-emerald-300 uppercase leading-none truncate">
                            {user.codeforcesHandle}
                          </h4>
                          <p className="text-[8px] font-medium text-emerald-500/50 uppercase mt-1">
                            {user.organization || "Independent Dev"}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[9px] text-emerald-500/70 border-t border-emerald-500/10 pt-3 font-mono">
                        <div className="flex justify-between py-0.5">
                          <span>REGISTRY ID</span>
                          <span className="text-emerald-400">#{user._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span>SYNC LEVEL</span>
                          <span className="text-emerald-300 uppercase">{summary?.currentLevel?.title || "Novice"}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span>AUTH DIV</span>
                          <span className="text-emerald-400 uppercase">ROLE_{user.role?.toUpperCase()}</span>
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
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 block">
                        [ TELEMETRY MONITOR ]
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

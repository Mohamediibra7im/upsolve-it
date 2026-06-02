"use client";

import Link from "next/link";
import {motion} from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart3,
  Flame,
  RefreshCw,
  Trophy,
  Activity,
  Shield,
  TrendingUp,
  Crown,
  Target,
  LogOut,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import {useRoadmapUserSummary} from "@/hooks/useRoadmap";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import Loader from "@/components/shared/Loader";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import useSWR from "swr";
import {swrFetcher} from "@/lib/apiClient";
import {useMemo} from "react";
import {isTrainingProblemCountedSolved, trainingSessionHasSolve} from "@/services/training/problemCountedSolved";

const getCFMilestone = (rating: number) => {
  if (rating < 1200)
    return {
      name: "Pupil",
      target: 1200,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      band: "0 - 1199",
    };
  if (rating < 1400)
    return {
      name: "Specialist",
      target: 1400,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      band: "1200 - 1399",
    };
  if (rating < 1600)
    return {
      name: "Expert",
      target: 1600,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      band: "1400 - 1599",
    };
  if (rating < 1900)
    return {
      name: "Candidate Master",
      target: 1900,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      band: "1600 - 1899",
    };
  if (rating < 2100)
    return {
      name: "Master",
      target: 2100,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      band: "1900 - 2099",
    };
  if (rating < 2300)
    return {
      name: "International Master",
      target: 2300,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      band: "2100 - 2299",
    };
  if (rating < 2400)
    return {
      name: "Grandmaster",
      target: 2400,
      color: "text-red-500 font-bold",
      bg: "bg-red-600/10",
      border: "border-red-600/20",
      band: "2300 - 2399",
    };
  return {
    name: "Legendary Grandmaster",
    target: 3000,
    color: "text-red-600 font-extrabold",
    bg: "bg-red-700/10",
    border: "border-red-700/20",
    band: "2400+",
  };
};

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function ProfilePage() {
  const {user, isLoading, syncProfile, logout} = useUser();
  const {summary, isLoading: isSummaryLoading} = useRoadmapUserSummary(!!user);
  const {history} = useHistory();
  const {upsolvedProblems} = useUpsolvedProblems();
  const {data: streaks} = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    {revalidateOnFocus: false},
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
    return {
      totalSessions,
      totalProblems,
      solvedProblems,
      avgPerformance,
      bestPerformance,
      solvingRate,
    };
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
    rating < 1200
      ? 0
      : rating < 1400
        ? 1200
        : rating < 1600
          ? 1400
          : rating < 1900
            ? 1600
            : rating < 2100
              ? 1900
              : rating < 2300
                ? 2100
                : 2300;

  const ratingDiff = milestone.target - rating;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((rating - currentTierStart) / (milestone.target - currentTierStart)) *
        100,
    ),
  );

  const profileStats = [
    {
      label: "Current Rating",
      value: user.rating || 0,
      sub: user.rank || "Unrated",
      icon: Trophy,
      tone: "text-amber-500",
    },
    {
      label: "Max Rating",
      value: user.maxRating || 0,
      sub: user.maxRank || "Unrated",
      icon: Crown,
      tone: "text-emerald-500",
    },
    {
      label: "Roadmap XP",
      value: summary?.totalXp?.toLocaleString() || 0,
      sub: "All time XP",
      icon: Flame,
      tone: "text-orange-500",
    },
    {
      label: "Problems Solved",
      value: summary?.problemsSolved || 0,
      sub: "Manual checklists",
      icon: Award,
      tone: "text-cyan-500",
    },
    {
      label: "Topics Completed",
      value: summary?.topicsCompleted || 0,
      sub: "Skills unlocked",
      icon: Target,
      tone: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen pb-20 pt-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl">
        {/* Profile Gamer Header Banner */}
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="relative overflow-hidden rounded-3xl border border-border/80 dark:border-border/40 bg-card/40 dark:bg-card/25 p-6 md:p-8 backdrop-blur-xl"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-[130px] opacity-80" />
            <div className="absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-emerald-500/10 blur-[110px] opacity-60" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* Profile Avatar Wrapper */}
              <div className="relative">
                <div className="rounded-full p-1 bg-gradient-to-br from-primary via-emerald-400 to-indigo-500 shadow-2xl shadow-primary/25">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-card">
                    <AvatarImage
                      src={user.avatar}
                      alt={user.codeforcesHandle}
                    />
                    <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                      {user.codeforcesHandle?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-card shadow-md animate-pulse" />
              </div>

              {/* Identity details */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    <Shield size={11} /> Competitive Programmer
                  </span>
                  {user.role === "admin" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      Admin
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none flex items-center gap-3">
                  {user.codeforcesHandle}
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  )}
                </h1>

                <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground/80">
                  <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                    CF: {user.rank || "Unrated"}
                  </span>
                  <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                    Org: {user.organization || "Independent"}
                  </span>
                  <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                    Skills: {summary?.currentLevel?.title || "Novice"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
              <Button
                onClick={syncProfile}
                variant="outline"
                className="h-11 flex-1 sm:flex-none rounded-xl border border-border/80 hover:border-primary/40 dark:border-border/40 hover:bg-primary/5 text-foreground hover:text-primary transition-all duration-300 font-bold uppercase tracking-wider text-[10px]"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Sync Handle
              </Button>
              <Button
                asChild
                className="h-11 flex-1 sm:flex-none rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 font-bold uppercase tracking-wider text-[10px]"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  To Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Main Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sidebar details */}
          <div className="xl:col-span-4 space-y-6">
            {/* Sync Server Status Card */}
            <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                  System Console
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                  <Activity size={10} className="animate-pulse" /> Online
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-[11px] text-muted-foreground/90">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>CF HANDLE</span>
                  <span className="text-foreground font-semibold">
                    {user.codeforcesHandle}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>ROLE DIV</span>
                  <span className="text-primary font-bold uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span>LAST ACTIVE</span>
                  <span className="text-foreground">
                    {user.lastSyncTime
                      ? new Date(user.lastSyncTime).toLocaleDateString()
                      : "Just now"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>CREATION CODE</span>
                  <span className="text-foreground/70">
                    #{user._id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>

            {/* CF Ranking Milestone Progression Gauge */}
            <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Milestone Progress
                </span>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                  CF Ranking Level
                </h3>
              </div>

              {/* Progress Bar Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">
                    Target Rank: {milestone.name}
                  </span>
                  <span className="text-foreground tabular-nums">
                    {rating} / {milestone.target}
                  </span>
                </div>

                <div className="h-2.5 bg-muted/60 dark:bg-muted/40 rounded-full overflow-hidden border border-border/40">
                  <motion.div
                    initial={{width: 0}}
                    animate={{width: `${progressPercent}%`}}
                    transition={{duration: 0.8, ease: "easeOut"}}
                    className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                  />
                </div>

                <div className="flex justify-between text-[9px] font-bold text-muted-foreground/60 uppercase">
                  <span>Current ({rating})</span>
                  <span>
                    {ratingDiff > 0
                      ? `${ratingDiff} rating left`
                      : "Milestone Reached"}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 dark:bg-muted/10 border border-border/30 rounded-xl text-xs text-muted-foreground/80 leading-relaxed font-medium">
                Climb to{" "}
                <span className="font-bold text-primary">
                  {milestone.target}
                </span>{" "}
                to advance from{" "}
                <span className="font-bold text-foreground">
                  {user.rank || "Recruit"}
                </span>{" "}
                to the next tier band.
              </div>
            </Card>

            {/* Streaks Card */}
            <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                  Activity Streaks
                </span>
                {streaks && (
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    streaks.consistencyScore >= 70
                      ? "text-emerald-500 bg-emerald-500/10"
                      : streaks.consistencyScore >= 40
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-muted-foreground bg-muted/30"
                  )}>
                    <Activity size={10} /> {streaks.consistencyScore}%
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
                  <Flame className="h-4 w-4 mx-auto mb-1 text-orange-400" />
                  <p className="text-lg font-black tabular-nums leading-none text-foreground">
                    {streaks?.trainingStreak ?? 0}
                  </p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">
                    Training
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
                  <Zap className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <p className="text-lg font-black tabular-nums leading-none text-foreground">
                    {streaks?.upsolveStreak ?? 0}
                  </p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">
                    Upsolve
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
                  <Crown className="h-4 w-4 mx-auto mb-1 text-emerald-400" />
                  <p className="text-lg font-black tabular-nums leading-none text-foreground">
                    {streaks?.bestStreak ?? 0}
                  </p>
                  <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">
                    Best
                  </p>
                </div>
              </div>
            </Card>

            {/* Account Settings */}
            <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                Account
              </h3>
              <ChangePasswordDialog />
              <Button
                variant="outline"
                onClick={logout}
                className="w-full h-11 rounded-xl border-border/80 hover:border-red-500/40 dark:border-border/40 bg-background/40 font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-500 transition-all"
              >
                <LogOut size={14} className="mr-2" /> Log Out
              </Button>
            </Card>
          </div>

          {/* Right Column: Dynamic Statistics Dashboard */}
          <div className="xl:col-span-8 space-y-8">
            {/* Modern Stats Widgets Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profileStats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{opacity: 0, y: 15}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: idx * 0.05}}
                >
                  <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full flex flex-col justify-between">
                    <stat.icon
                      className={cn(
                        "absolute -top-3 -right-3 h-14 w-14 opacity-5 group-hover:opacity-10 transition-opacity",
                        stat.tone,
                      )}
                    />

                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                      {stat.label}
                    </span>

                    <div className="mt-4 space-y-1">
                      <h3 className="text-3xl font-[1000] tracking-tight text-foreground">
                        {stat.value}
                      </h3>
                      <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide">
                        {stat.sub}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Training Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}}>
                <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
                  <BarChart3 className="absolute -top-3 -right-3 h-14 w-14 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Sessions</span>
                  <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.totalSessions ?? 0}</h3>
                  <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Total completed</p>
                </Card>
              </motion.div>
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.15}}>
                <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
                  <CheckCircle2 className="absolute -top-3 -right-3 h-14 w-14 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Solved</span>
                  <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">
                    {trainingStats?.solvedProblems ?? 0}
                    <span className="text-sm font-bold text-muted-foreground/50 ml-1">/ {trainingStats?.totalProblems ?? 0}</span>
                  </h3>
                  <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">{trainingStats?.solvingRate ?? 0}% rate</p>
                </Card>
              </motion.div>
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}>
                <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
                  <TrendingUp className="absolute -top-3 -right-3 h-14 w-14 opacity-5 group-hover:opacity-10 transition-opacity text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Avg Perf</span>
                  <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.avgPerformance ?? "—"}</h3>
                  <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Rating performance</p>
                </Card>
              </motion.div>
              <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}}>
                <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
                  <Sparkles className="absolute -top-3 -right-3 h-14 w-14 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Best Perf</span>
                  <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.bestPerformance ?? "—"}</h3>
                  <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Personal record</p>
                </Card>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div initial={{opacity: 0, y: 15}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}}>
              <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground/60" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                      Recent Activity
                    </span>
                  </div>
                  <Link
                    href="/statistics"
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                  >
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border/20">
                  {recentSessions.length > 0 ? recentSessions.map((session) => {
                    const solved = session.problems.filter(isTrainingProblemCountedSolved).length;
                    const total = session.problems.length;
                    const mode = session.trainingMode ?? "training";
                    return (
                      <div key={session._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            solved > 0 ? "bg-emerald-500" : "bg-muted-foreground/30"
                          )} />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground capitalize truncate block">
                              {mode} Session
                            </span>
                            <span className="text-[9px] text-muted-foreground/60 font-medium">
                              {new Date(session.startTime).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"})}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-[10px] font-bold text-muted-foreground/70 tabular-nums">
                            {solved}/{total}
                          </span>
                          <span className="text-[10px] font-black text-primary tabular-nums w-12 text-right">
                            {session.performance ?? "—"}
                          </span>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="px-5 py-8 text-center">
                      <p className="text-xs text-muted-foreground/50 font-medium">No practice sessions yet.</p>
                      <Button asChild variant="outline" className="mt-3 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest">
                        <Link href="/training">Start Your First Session</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

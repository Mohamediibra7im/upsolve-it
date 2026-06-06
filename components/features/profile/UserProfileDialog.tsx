"use client";

import Image from "next/image";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Target,
  Loader2,
  Zap,
  Calendar,
  Clock,
  Shield,
  Trophy,
  Award,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiFetcher } from "@/lib/apiClient";
import { formatAvgProblemRating } from "@/services/training/formatAvgProblemRating";

export interface UserTrainingStatsView {
  user: {
    avatar?: string;
    codeforcesHandle: string;
    rating: number;
    rank: string;
    maxRating: number;
    maxRank: string;
    xp?: number;
    levelsCompleted?: number;
    topicsCompleted?: number;
  };
  stats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    upsolvedCount: number;
    upsolvedSolvedCount: number;
    averagePerformance: number;
    bestPerformance: number;
    worstPerformance: number;
    solvingRate: number;
    averageRating: number;
    recentTrend: number;
    recentSessions: number;
  };
  trainings: Array<{
    id: string;
    startTime: number;
    endTime: number;
    performance: number;
    problemsCount: number;
    solvedCount: number;
  }>;
}

interface UserProfileDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Gamified Rank Styles and Glowing Color Maps
const getRankAesthetics = (rating: number) => {
  if (rating === 0) return { text: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10", glow: "shadow-zinc-500/10", label: "Unrated", glowBg: "bg-zinc-500" };
  if (rating < 1200) return { text: "text-zinc-400", border: "border-zinc-500/25", bg: "bg-zinc-500/10", glow: "shadow-zinc-500/10", label: "Newbie", glowBg: "bg-zinc-500" };
  if (rating < 1400) return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20", label: "Pupil", glowBg: "bg-emerald-500" };
  if (rating < 1600) return { text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20", label: "Specialist", glowBg: "bg-cyan-500" };
  if (rating < 1900) return { text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", glow: "shadow-blue-500/20", label: "Expert", glowBg: "bg-blue-500" };
  if (rating < 2100) return { text: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/10", glow: "shadow-violet-500/20", label: "Candidate Master", glowBg: "bg-violet-500" };
  if (rating < 2300) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-amber-500/20", label: "Master", glowBg: "bg-amber-500" };
  if (rating < 2400) return { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10", glow: "shadow-orange-500/20", label: "International Master", glowBg: "bg-orange-500" };
  if (rating < 2600) return { text: "text-rose-500", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-rose-500/20", label: "Grandmaster", glowBg: "bg-rose-500" };
  if (rating < 3000) return { text: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10", glow: "shadow-red-500/30", label: "International Grandmaster", glowBg: "bg-red-500" };
  return { text: "text-red-600 font-extrabold animate-pulse", border: "border-red-600/40", bg: "bg-red-600/15", glow: "shadow-red-600/40", label: "Legendary Grandmaster", glowBg: "bg-red-600" };
};

const getXPLevel = (xp: number) => {
  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXp = level * 1000;
  const prevLevelXp = (level - 1) * 1000;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / 1000) * 100));
  
  let title = "Novice";
  if (xp >= 5000) title = "Legend";
  else if (xp >= 3000) title = "Champion";
  else if (xp >= 1500) title = "Strategist";
  else if (xp >= 500) title = "Tactician";

  return { level, nextLevelXp, progressPercent, title };
};

// Reusable Circular Skill Ring Component
interface SkillRingProps {
  percent: number;
  label: string;
  icon: any;
  colorClass: string;
  glowColor: string;
}

function SkillRing({ percent, label, icon: Icon, colorClass }: Readonly<SkillRingProps>) {
  const radius = 32;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md relative overflow-hidden group w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.01] pointer-events-none" />
      <div className="relative size-20 mb-2">
        <svg className="size-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-muted/40"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <m.circle
            cx="40"
            cy="40"
            r={radius}
            className={cn("transition-all duration-1000 ease-out", colorClass)}
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        {/* Center Icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={cn("size-4.5 opacity-80 group-hover:scale-110 transition-transform duration-300", colorClass.replace("stroke-", "text-"))} />
        </div>
      </div>
      <div className="text-center">
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 block leading-none mb-1">
          {label}
        </span>
        <span className="text-lg font-heading font-black text-foreground tabular-nums">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export function UserProfileDialog({
  userId,
  open,
  onOpenChange,
}: Readonly<UserProfileDialogProps>) {
  const { data: userStats, error, isLoading } = useSWR<UserTrainingStatsView>(
    open && userId ? `/api/roadmap/users/${userId}/stats` : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const stats = userStats?.stats;
  const user = userStats?.user;
  const xp = user?.xp ?? 0;
  const { level, progressPercent, title: xpTitle } = getXPLevel(xp);
  const aesthetic = getRankAesthetics(user?.rating ?? 0);

  // Compute Achievements (Gamified Badges)
  const achievements = [
    {
      id: "gladiator",
      name: "Gladiator",
      desc: "Cleared 5+ Arena training runs",
      icon: Trophy,
      unlocked: (stats?.totalSessions ?? 0) >= 5,
      color: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    },
    {
      id: "marksman",
      name: "Marksman",
      desc: "Maintained a 70%+ solving accuracy",
      icon: Target,
      unlocked: (stats?.solvingRate ?? 0) >= 70,
      color: "text-primary border-primary/20 bg-primary/5",
    },
    {
      id: "upsolve-elite",
      name: "Upsolve Elite",
      desc: "Successfully upsolved a target task",
      icon: CheckCircle,
      unlocked: (stats?.upsolvedSolvedCount ?? 0) >= 1,
      color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
    },
    {
      id: "titan",
      name: "Performance Titan",
      desc: "Avg session score exceeds 1200",
      icon: Zap,
      unlocked: (stats?.averagePerformance ?? 0) >= 1200,
      color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/5",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[150] w-[95vw] max-w-5xl h-[88vh] overflow-hidden rounded-[2.5rem] border-border bg-background p-0 shadow-2xl flex flex-col focus:outline-none select-none">
        {isLoading && !userStats ? (
          <>
            <DialogTitle className="sr-only">Loading Character Sheet</DialogTitle>
            <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Loader2 className="size-12 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                Synchronizing Database...
              </p>
            </div>
          </>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <Trophy className="size-12 text-destructive opacity-40 animate-bounce" />
            <h3 className="text-lg font-black uppercase text-foreground">Could Not Load Stats</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There was an issue fetching practice data for this user. Please try again later.
            </p>
            <Button onClick={() => onOpenChange(false)} className="rounded-xl font-bold uppercase text-xs">
              Close Profile
            </Button>
          </div>
        ) : userStats ? (
          <>
            {/* Scrollable Bento Grid Area */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-7 custom-scrollbar bg-background">
              
              {/* Bento Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-max">
                
                {/* 1. Identity profile Card (Col Span 8) */}
                <div className="col-span-12 md:col-span-8 bg-card/25 border border-border/50 dark:border-border/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                  {/* Rating-specific background blur glow */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div
                      className={cn(
                        "absolute -top-[20%] -left-[10%] size-60 rounded-full blur-[100px] opacity-35 animate-pulse",
                        aesthetic.glowBg
                      )}
                    />
                    <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:20px_20px]" />
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full">
                    {/* Avatar & Handle info */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <m.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120 }}
                        className={cn(
                          "size-20 rounded-[1.5rem] bg-background border-2 shadow-xl flex items-center justify-center p-0.5 relative group shrink-0",
                          aesthetic.border,
                          aesthetic.glow
                        )}
                      >
                        <div className="size-full rounded-[1.3rem] overflow-hidden relative">
                          {user?.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.codeforcesHandle}
                              width={80}
                              height={80}
                              unoptimized
                              className="size-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <BarChart className="size-10 text-primary" />
                          )}
                        </div>
                        <span className={cn(
                          "absolute -bottom-1 -right-1 size-5.5 border-2 border-background rounded-full flex items-center justify-center text-[9px] font-black text-background bg-primary shadow-md"
                        )}>
                          {level}
                        </span>
                      </m.div>

                      <div className="space-y-1">
                        <DialogTitle className="text-2xl font-heading font-black tracking-tight text-foreground uppercase flex items-center justify-center sm:justify-start gap-1.5 leading-none">
                          {user?.codeforcesHandle}
                          {user && user.rating >= 1900 && (
                            <Sparkles className="size-5 text-amber-400 animate-spin-slow shrink-0" />
                          )}
                        </DialogTitle>
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8.5px] font-black uppercase tracking-widest bg-secondary/40 text-muted-foreground select-none"
                        )}>
                          <span className={cn(aesthetic.text)}>{aesthetic.label}</span>
                          {user && user.rating > 0 && (
                            <span className="opacity-60 font-mono">({user.rating} Elo)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Level Title & Shield */}
                    <div className="flex items-center gap-2.5 bg-card/45 border border-border/30 rounded-2xl p-3 shrink-0">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-primary-foreground font-black text-xs relative shadow-md">
                        <Shield className="absolute inset-0 size-full stroke-none fill-current opacity-20" />
                        <span className="relative z-10 font-mono">L1</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest block leading-none mb-1">
                          Rank Title
                        </span>
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">
                          {xpTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level & XP Progression HUD */}
                  <div className="relative z-10 w-full mt-4 space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 leading-none">
                      <span>XP Progress</span>
                      <span>{xp % 1000} / 1000 XP</span>
                    </div>
                    <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/20 p-[1px]">
                      <m.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer" />
                      </m.div>
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] font-bold text-muted-foreground/45 uppercase tracking-widest leading-none">
                      <span>total accumulated: {xp.toLocaleString()} XP</span>
                      <span>{1000 - (xp % 1000)} XP to next level</span>
                    </div>
                  </div>
                </div>

                {/* 2. Attributes Hub (Col Span 4) */}
                <div className="col-span-12 md:col-span-4 bg-card/25 border border-border/50 dark:border-border/20 rounded-3xl p-5 flex flex-col justify-between min-h-[200px]">
                  <div>
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3 px-0.5 leading-none">Character Attributes</h3>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-card/30 border border-border/30 rounded-xl p-2.5 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-wider leading-none mb-1">Runs</span>
                        <span className="text-base font-heading font-black text-foreground tabular-nums leading-none">{stats?.totalSessions ?? 0}</span>
                      </div>
                      <div className="bg-card/30 border border-border/30 rounded-xl p-2.5 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-wider leading-none mb-1">Solved</span>
                        <span className="text-base font-heading font-black text-foreground tabular-nums leading-none">{stats?.solvedProblems ?? 0}</span>
                      </div>
                      <div className="bg-card/30 border border-border/30 rounded-xl p-2.5 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] font-black text-muted-foreground/50 uppercase tracking-wider leading-none mb-1">Roadmap XP</span>
                        <span className="text-base font-heading font-black text-foreground tabular-nums leading-none">{xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/30 border border-border/30 rounded-2xl p-4 flex items-center justify-between mt-3">
                    <div>
                      <span className="text-[7.5px] font-black text-muted-foreground/60 uppercase tracking-widest block leading-none mb-1">Difficulty Target</span>
                      <span className="text-sm font-heading font-black text-foreground tabular-nums leading-none">
                        {stats ? formatAvgProblemRating(stats.averageRating) : "Unrated"}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <Award size={16} />
                    </div>
                  </div>
                </div>

                {/* 3. Precision Circles (Col Span 4) */}
                <div className="col-span-12 md:col-span-4 bg-card/25 border border-border/50 dark:border-border/20 rounded-3xl p-5 flex flex-col justify-between min-h-[220px]">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-0.5 leading-none">Tactical Precision</h3>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <SkillRing
                      percent={stats?.solvingRate ?? 0}
                      label="Accuracy"
                      icon={Target}
                      colorClass="stroke-primary"
                      glowColor="rgba(var(--primary), 0.2)"
                    />
                    <SkillRing
                      percent={stats?.upsolvedCount ? Math.round((stats.upsolvedSolvedCount / stats.upsolvedCount) * 100) : 0}
                      label="Upsolving"
                      icon={CheckCircle}
                      colorClass="stroke-emerald-400"
                      glowColor="rgba(52, 211, 153, 0.2)"
                    />
                  </div>
                </div>

                {/* 4. Achievements Grid (Col Span 8) */}
                <div className="col-span-12 md:col-span-8 bg-card/25 border border-border/50 dark:border-border/20 rounded-3xl p-5 flex flex-col justify-between min-h-[220px]">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-0.5 leading-none mb-3">Unlockable Achievements</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 flex-1">
                    {achievements.map((badge, idx) => {
                      const Icon = badge.icon;
                      return (
                        <m.div
                          key={badge.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="h-full"
                        >
                          <div
                            className={cn(
                              "flex items-center gap-3.5 px-4 py-2.5 rounded-2xl border transition-all duration-300 relative overflow-hidden h-full min-h-[60px]",
                              badge.unlocked
                                ? cn("border-border/60 bg-card/45 hover:border-primary/30", badge.color.split(" ")[0])
                                : "border-border/20 bg-muted/5 opacity-30 select-none border-dashed"
                            )}
                          >
                            {/* Unlock Icon */}
                            <div className={cn(
                              "p-2 rounded-xl shrink-0 border relative",
                              badge.unlocked ? badge.color.split(" ").slice(1).join(" ") : "bg-muted/10 border-border/40"
                            )}>
                              <Icon className="size-4" />
                              {badge.unlocked && (
                                <span className="absolute -top-1 -right-1 flex size-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 pr-10">
                              <h4 className="text-xs font-black uppercase tracking-wider text-foreground leading-none">
                                {badge.name}
                              </h4>
                              <p className="text-[8.5px] text-muted-foreground mt-1 leading-tight font-medium">
                                {badge.desc}
                              </p>
                            </div>
                            
                            {/* Lock Overlay for Locked Badges */}
                            {!badge.unlocked && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[7.5px] font-black text-muted-foreground/60 uppercase tracking-wider">
                                Locked
                              </div>
                            )}
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Session Timeline (Col Span 12) */}
                <div className="col-span-12 bg-card/25 border border-border/50 dark:border-border/20 rounded-3xl p-5 min-h-[200px] flex flex-col justify-between">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-0.5 leading-none mb-3">Chronicle of Sessions</h3>

                  <div className="relative w-full overflow-x-auto custom-scrollbar pb-2 pt-1 flex items-center">
                    {userStats?.trainings && userStats.trainings.length > 0 ? (
                      <div className="flex items-center gap-6 min-w-full px-2 relative min-h-[120px]">
                        {/* Horizontal timeline track line */}
                        <div className="absolute top-[40px] left-8 right-8 h-0.5 bg-gradient-to-r from-primary/20 via-emerald-500/20 to-transparent pointer-events-none z-0" />

                        {userStats.trainings.map((training, i) => {
                          const percent = training.problemsCount > 0 ? Math.round((training.solvedCount / training.problemsCount) * 100) : 0;
                          
                          // Circular progress variables
                          const radius = 16;
                          const stroke = 3;
                          const circumference = 2 * Math.PI * radius;
                          const strokeDashoffset = circumference - (percent / 100) * circumference;

                          return (
                            <m.div
                              key={training.id}
                              initial={{ opacity: 0, scale: 0.9, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.04 }}
                              className="relative flex flex-col items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-card/50 shadow-md w-36 shrink-0 z-10 hover:border-primary/40 hover:scale-105 transition-all duration-300 group/timeline cursor-default select-none"
                            >
                              {/* Date badge */}
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2">
                                {new Date(training.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>

                              {/* Center: circular progress ring */}
                              <div className="relative size-12 mb-2">
                                <svg className="size-full -rotate-90">
                                  {/* Background ring */}
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r={radius}
                                    className="stroke-muted/30"
                                    strokeWidth={stroke}
                                    fill="transparent"
                                  />
                                  {/* Progress ring */}
                                  <circle
                                    cx="24"
                                    cy="24"
                                    r={radius}
                                    className="stroke-primary group-hover/timeline:stroke-emerald-400 transition-colors"
                                    strokeWidth={stroke}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-[8.5px] font-black text-foreground">
                                  {training.solvedCount}/{training.problemsCount}
                                </div>
                              </div>

                              {/* Performance score & duration */}
                              <div className="text-center w-full mt-1">
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider leading-none shadow-[0_0_8px_rgba(var(--primary),0.05)]">
                                  {training.performance} <span className="text-[6.5px] text-primary/70 font-bold font-sans">PTS</span>
                                </div>
                                <div className="text-[7.5px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none mt-1.5 flex items-center justify-center gap-1">
                                  <Clock size={8} className="opacity-70" />
                                  {Math.round((training.endTime - training.startTime) / 60000)}m
                                </div>
                              </div>
                            </m.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-8 text-center space-y-2 opacity-30">
                        <Calendar size={22} />
                        <p className="text-[9px] font-black uppercase tracking-widest">No Practice Sessions</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Fixed Dialog Footer */}
            <div className="shrink-0 p-4 border-t border-border bg-card/25 flex justify-between items-center px-6 sm:px-8">
              <div className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 select-none">
                <Shield size={12} className="opacity-80" />
                Community Practice Profile
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="rounded-xl px-8 h-9 font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Close Profile
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

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
  Sparkles,
  ExternalLink
} from "lucide-react";
import { m as motion } from "framer-motion";
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
  if (rating === 0) return { text: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10", label: "Unrated" };
  if (rating < 1200) return { text: "text-zinc-400", border: "border-zinc-500/25", bg: "bg-zinc-500/10", label: "Newbie" };
  if (rating < 1400) return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", label: "Pupil" };
  if (rating < 1600) return { text: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10", label: "Specialist" };
  if (rating < 1900) return { text: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10", label: "Expert" };
  if (rating < 2100) return { text: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/10", label: "Candidate Master" };
  if (rating < 2300) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", label: "Master" };
  if (rating < 2400) return { text: "text-orange-400", border: "border-orange-500/30", bg: "bg-orange-500/10", label: "International Master" };
  if (rating < 2600) return { text: "text-rose-500", border: "border-rose-500/30", bg: "bg-rose-500/10", label: "Grandmaster" };
  if (rating < 3000) return { text: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10", label: "International Grandmaster" };
  return { text: "text-red-500 font-extrabold animate-pulse", border: "border-red-500/40", bg: "bg-red-500/15", label: "Legendary Grandmaster" };
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

// Monospace Skill Gauge block selector instead of circular SVG rings
interface SkillGaugeProps {
  percent: number;
  label: string;
  icon: any;
}

function SkillGauge({ percent, label, icon: Icon }: Readonly<SkillGaugeProps>) {
  const bars = 10;
  const activeBars = Math.round((percent / 100) * bars);
  const gaugeStr = "█".repeat(activeBars) + "░".repeat(bars - activeBars);

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-sm border border-emerald-500/15 bg-[#040604]/50 relative overflow-hidden group w-full text-center space-y-2 font-mono">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <Icon className="size-3.5" />
        <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40">
          {label}
        </span>
      </div>
      <div className="text-[10px] tracking-widest font-bold">
        <span className="text-emerald-500/30">[</span>
        <span className="text-emerald-450">{gaugeStr.substring(0, activeBars)}</span>
        <span className="text-emerald-500/10">{gaugeStr.substring(activeBars)}</span>
        <span className="text-emerald-500/30">]</span>
      </div>
      <div className="text-base font-bold text-white tabular-nums leading-none">
        {percent}%
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
      color: "text-emerald-450 border-emerald-500/20 bg-emerald-500/5",
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
      <DialogContent className="z-[150] w-[95vw] max-w-4xl h-[88vh] overflow-hidden border border-emerald-500/20 bg-[#060a08] p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col font-mono text-emerald-400 select-none">
        {isLoading && !userStats ? (
          <>
            <DialogTitle className="sr-only">Loading Character Sheet</DialogTitle>
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="size-10 animate-spin text-emerald-400" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 animate-pulse">
                Synchronizing Database...
              </p>
            </div>
          </>
        ) : error ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <Trophy className="size-10 text-red-500/40 animate-bounce" />
            <h3 className="text-xs font-bold uppercase text-white tracking-wider">Could Not Load Stats</h3>
            <p className="text-[10px] text-emerald-500/50 uppercase max-w-xs leading-relaxed">
              There was an issue fetching practice data for this user from the diagnostics database.
            </p>
            <Button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase text-[9px] hover:bg-emerald-500/10 font-mono">
              Close Profile
            </Button>
          </div>
        ) : userStats ? (
          <>
            {/* Scrollable Bento Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#060a08]/20 space-y-4">
              
              {/* Bento Grid Container */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-max">
                
                {/* 1. Identity profile Card (Col Span 8) */}
                <div className="col-span-12 md:col-span-8 bg-[#060a08]/30 border border-emerald-500/15 rounded-sm p-5 flex flex-col justify-between min-h-[170px]">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 w-full">
                    {/* Avatar & Handle info */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <motion.div
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                          "size-18 rounded-sm bg-[#040604] border flex items-center justify-center p-0.5 relative group shrink-0",
                          aesthetic.border
                        )}
                      >
                        <div className="size-full rounded-sm overflow-hidden relative bg-[#040604]">
                          {user?.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.codeforcesHandle}
                              width={72}
                              height={72}
                              unoptimized
                              className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <BarChart className="size-8 text-emerald-500" />
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 size-5 border border-emerald-500/20 rounded-sm flex items-center justify-center text-[9px] font-black text-emerald-950 bg-emerald-400">
                          {level}
                        </span>
                      </motion.div>
 
                      <div className="space-y-1.5">
                        <DialogTitle className="text-lg font-bold tracking-wider text-white uppercase flex items-center justify-center sm:justify-start gap-1.5 leading-none">
                          {user?.codeforcesHandle}
                          {user && user.rating >= 1900 && (
                            <Sparkles className="size-4 text-amber-400 shrink-0" />
                          )}
                        </DialogTitle>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border border-emerald-500/10 text-[8px] font-bold uppercase tracking-wider bg-emerald-500/5 select-none">
                            <span className={cn(aesthetic.text)}>{aesthetic.label}</span>
                            {user && user.rating > 0 && (
                              <span className="opacity-60">({user.rating} ELO)</span>
                            )}
                          </div>

                          {user?.codeforcesHandle && (
                            <a
                              href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-500/20 hover:border-emerald-500/55 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-sm text-[8px] font-bold uppercase tracking-wider text-emerald-300 transition-all"
                            >
                              <span>[ CF_PROFILE.SH ]</span>
                              <ExternalLink size={9} className="shrink-0" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
 
                    {/* Level Title & Shield */}
                    <div className="flex items-center gap-2.5 bg-[#040604]/40 border border-emerald-500/10 rounded-sm p-2 shrink-0">
                      <div className="size-9 rounded-sm bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs relative">
                        <span className="relative z-10">L1</span>
                      </div>
                      <div>
                        <span className="text-[7px] font-bold text-emerald-500/35 uppercase tracking-widest block leading-none mb-1">
                          Rank Title
                        </span>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {xpTitle}
                        </span>
                      </div>
                    </div>
                  </div>
 
                  {/* Level & XP Progression HUD */}
                  <div className="relative z-10 w-full mt-4 space-y-1.5">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-emerald-500/50 leading-none">
                      <span>XP Progress</span>
                      <span>{xp % 1000} / 1000 XP</span>
                    </div>
                    <div className="h-2 w-full bg-[#040604] border border-emerald-500/15 p-[1px] rounded-sm">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-emerald-500 rounded-sm"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[7px] font-bold text-emerald-500/35 uppercase tracking-wider leading-none">
                      <span>total accumulated: {xp.toLocaleString()} XP</span>
                      <span>{1000 - (xp % 1000)} XP to next level</span>
                    </div>
                  </div>
                </div>
 
                {/* 2. Attributes Hub (Col Span 4) */}
                <div className="col-span-12 md:col-span-4 bg-[#060a08]/30 border border-emerald-500/15 rounded-sm p-4 flex flex-col justify-between min-h-[170px]">
                  <div>
                    <h3 className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 mb-3 leading-none">{"// Attributes"}</h3>
                    
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px] uppercase font-bold">
                      <div className="bg-[#040604] border border-emerald-500/10 rounded-sm p-2 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] text-emerald-500/35 leading-none mb-1">Runs</span>
                        <span className="text-sm font-bold text-emerald-350 leading-none">{stats?.totalSessions ?? 0}</span>
                      </div>
                      <div className="bg-[#040604] border border-emerald-500/10 rounded-sm p-2 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] text-emerald-500/35 leading-none mb-1">Solved</span>
                        <span className="text-sm font-bold text-emerald-350 leading-none">{stats?.solvedProblems ?? 0}</span>
                      </div>
                      <div className="bg-[#040604] border border-emerald-500/10 rounded-sm p-2 text-center flex flex-col justify-center items-center">
                        <span className="text-[7px] text-emerald-500/35 leading-none mb-1">Xp</span>
                        <span className="text-sm font-bold text-emerald-350 leading-none">{xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp}</span>
                      </div>
                    </div>
                  </div>
 
                  <div className="bg-[#040604]/30 border border-emerald-500/10 rounded-sm p-3 flex items-center justify-between mt-3 text-[10px] uppercase">
                    <div>
                      <span className="text-[7px] font-bold text-emerald-500/35 block leading-none mb-1">Difficulty Target</span>
                      <span className="text-xs font-bold text-white">
                        {stats ? formatAvgProblemRating(stats.averageRating) : "Unrated"}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-sm bg-emerald-500/5 border border-emerald-500/15 text-emerald-450">
                      <Award size={14} />
                    </div>
                  </div>
                </div>
 
                {/* 3. Precision Circles (Col Span 4) */}
                <div className="col-span-12 md:col-span-4 bg-[#060a08]/30 border border-emerald-500/15 rounded-sm p-4 flex flex-col justify-between min-h-[200px]">
                  <h3 className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 leading-none">{"// Precision"}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <SkillGauge
                      percent={stats?.solvingRate ?? 0}
                      label="Accuracy"
                      icon={Target}
                    />
                    <SkillGauge
                      percent={stats?.upsolvedCount ? Math.round((stats.upsolvedSolvedCount / stats.upsolvedCount) * 100) : 0}
                      label="Upsolving"
                      icon={CheckCircle}
                    />
                  </div>
                </div>
 
                {/* 4. Achievements Grid (Col Span 8) */}
                <div className="col-span-12 md:col-span-8 bg-[#060a08]/30 border border-emerald-500/15 rounded-sm p-4 flex flex-col justify-between min-h-[200px]">
                  <h3 className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 leading-none mb-3">{"// Achievements"}</h3>
 
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    {achievements.map((badge, idx) => {
                      const Icon = badge.icon;
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="h-full"
                        >
                          <div
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-sm border transition-all duration-300 relative overflow-hidden h-full min-h-[50px] uppercase",
                              badge.unlocked
                                ? "border-emerald-500/15 bg-emerald-500/5"
                                : "border-emerald-500/5 bg-transparent opacity-20 border-dashed"
                            )}
                          >
                            {/* Unlock Icon */}
                            <div className={cn(
                              "p-1.5 rounded-sm shrink-0 border relative",
                              badge.unlocked ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450" : "bg-transparent border-emerald-500/5"
                            )}>
                              <Icon className="size-3.5" />
                              {badge.unlocked && (
                                <span className="absolute -top-1 -right-1 flex size-1.5">
                                  <span className="relative inline-flex rounded-full size-1.5 bg-emerald-450" />
                                </span>
                              )}
                            </div>
 
                            <div className="min-w-0 pr-6">
                              <h4 className="text-[10px] font-bold text-white leading-none">
                                {badge.name}
                              </h4>
                              <p className="text-[8px] text-emerald-500/40 mt-1 leading-tight">
                                {badge.desc}
                              </p>
                            </div>
                            
                            {!badge.unlocked && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[7.5px] font-bold text-emerald-500/20 tracking-wider">
                                LOCKED
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
 
                {/* 5. Session Timeline (Col Span 12) */}
                <div className="col-span-12 bg-[#060a08]/30 border border-emerald-500/15 rounded-sm p-4 min-h-[180px] flex flex-col justify-between">
                  <h3 className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 leading-none mb-3">{"// Chronicle of Sessions"}</h3>
 
                  <div className="relative w-full overflow-x-auto custom-scrollbar pb-1.5 pt-0.5 flex items-center">
                    {userStats?.trainings && userStats.trainings.length > 0 ? (
                      <div className="flex items-center gap-4 min-w-full px-1 relative min-h-[90px]">
                        {/* Horizontal timeline track line */}
                        <div className="absolute top-[32px] left-8 right-8 h-[1px] bg-emerald-500/10 pointer-events-none z-0" />
 
                        {userStats.trainings.map((training, i) => {
                          const percent = training.problemsCount > 0 ? Math.round((training.solvedCount / training.problemsCount) * 100) : 0;
                          
                          return (
                            <motion.div
                              key={training.id}
                              initial={{ opacity: 0, scale: 0.98, x: 10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ delay: 0.1 + i * 0.04 }}
                              className="relative flex flex-col items-center justify-between p-3 rounded-sm border border-emerald-500/10 bg-[#060a08]/50 w-32 shrink-0 z-10 hover:border-emerald-500/25 transition-all duration-300 group/timeline cursor-default select-none uppercase"
                            >
                              {/* Date badge */}
                              <div className="text-[8px] font-bold text-emerald-500/40 tracking-wider leading-none mb-2">
                                {new Date(training.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
 
                              {/* Center text score ratio */}
                              <div className="text-center space-y-1 mb-2">
                                <div className="text-[10px] font-bold text-white leading-none">
                                  {training.solvedCount}/{training.problemsCount} SOLVED
                                </div>
                                <div className="text-[7.5px] font-bold text-emerald-500/20 tracking-tighter leading-none">
                                  [
                                  <span className="text-emerald-450">{"█".repeat(Math.round((percent / 100) * 5))}</span>
                                  <span className="text-emerald-500/10">{"░".repeat(5 - Math.round((percent / 100) * 5))}</span>
                                  ]
                                </div>
                              </div>
 
                              {/* Performance score & duration */}
                              <div className="text-center w-full mt-1.5">
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-emerald-500/15 bg-emerald-500/5 text-emerald-400 text-[8px] font-bold tracking-wider leading-none">
                                  {training.performance} <span className="text-[6.5px] opacity-75">PTS</span>
                                </div>
                                <div className="text-[7px] font-bold text-emerald-500/35 tracking-widest leading-none mt-1.5 flex items-center justify-center gap-0.5">
                                  <Clock size={8} />
                                  {Math.round((training.endTime - training.startTime) / 60000)}M
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-6 text-center space-y-1.5 opacity-30">
                        <Calendar size={18} />
                        <p className="text-[8px] font-bold uppercase tracking-wider">No Practice Sessions</p>
                      </div>
                    )}
                  </div>
                </div>
 
              </div>
 
            </div>
 
            {/* Fixed Dialog Footer */}
            <div className="shrink-0 p-4 border-t border-emerald-500/10 bg-[#060a08] flex justify-between items-center px-6 sm:px-8">
              <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <Shield size={12} />
                <span>Community Practice Profile</span>
              </div>
              <Button
                onClick={() => onOpenChange(false)}
                className="h-8 px-5 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_8px_rgba(16,185,129,0.15)] hover:scale-102 active:scale-98 transition-all font-mono"
              >
                [ CLOSE_PROFILE.EXE ]
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

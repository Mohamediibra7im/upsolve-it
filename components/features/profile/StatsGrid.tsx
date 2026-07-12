"use client";

import Link from "next/link";
import { m } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";

interface ProfileStatsGridProps {
  profileStats: Array<{
    label: string;
    value: string | number;
    sub: string;
    icon: any;
    tone: string;
  }>;
}

export function ProfileStatsGrid({ profileStats }: ProfileStatsGridProps) {
  return (
    <div className="flex flex-wrap gap-4 font-mono text-emerald-400 w-full">
      {profileStats.map((stat, idx) => (
        <m.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex-1 min-w-[150px] sm:min-w-[180px]"
        >
          <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#060a08]/60 p-4 transition-all duration-300 hover:border-emerald-500/40 group flex flex-col justify-between h-full">
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.1]" />
            <stat.icon
              className={cn(
                "absolute top-4 right-4 size-10 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity",
                stat.tone,
              )}
            />
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/45 block">
                {stat.label}
              </span>
              <h3 className={cn("text-2xl font-black tracking-tight leading-none", stat.tone)}>
                {stat.value}
              </h3>
              <p className="text-[9px] font-bold text-emerald-500/60 pt-2 border-t border-emerald-500/10 mt-2">
                &gt; {stat.sub}
              </p>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}

interface TrainingStatsGridProps {
  trainingStats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    avgPerformance: number | null;
    bestPerformance: number | null;
    solvingRate: number;
  } | null;
}

export function TrainingStatsGrid({ trainingStats }: TrainingStatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-emerald-400 w-full">
      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#060a08]/60 p-4 transition-all duration-300 hover:border-emerald-500/40 group h-full">
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.1]" />
          <BarChart3 className="absolute top-4 right-4 size-10 opacity-[0.03] group-hover:opacity-[0.1] text-cyan-400 transition-opacity" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/45 block">Sessions</span>
          <h3 className="text-2xl font-black text-cyan-400 glow-text-cyan leading-none mt-1">
            {trainingStats?.totalSessions ?? 0}
          </h3>
          <p className="text-[8px] font-bold text-emerald-500/40 uppercase pt-2 border-t border-emerald-500/10 mt-2">
            &gt; TOTAL RUNS LOGGED
          </p>
        </div>
      </m.div>

      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#060a08]/60 p-4 transition-all duration-300 hover:border-emerald-500/40 group h-full">
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.1]" />
          <CheckCircle2 className="absolute top-4 right-4 size-10 opacity-[0.03] group-hover:opacity-[0.1] text-emerald-400 transition-opacity" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/45 block">Solved</span>
          <h3 className="text-2xl font-black text-emerald-400 glow-text-emerald leading-none mt-1">
            {trainingStats?.solvedProblems ?? 0}
            <span className="text-xs font-bold text-emerald-500/45 ml-1">/ {trainingStats?.totalProblems ?? 0}</span>
          </h3>
          <p className="text-[8px] font-bold text-emerald-500/40 uppercase pt-2 border-t border-emerald-500/10 mt-2">
            &gt; {trainingStats?.solvingRate ?? 0}% SUCCESS RATE
          </p>
        </div>
      </m.div>

      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#060a08]/60 p-4 transition-all duration-300 hover:border-emerald-500/40 group h-full">
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.1]" />
          <TrendingUp className="absolute top-4 right-4 size-10 opacity-[0.03] group-hover:opacity-[0.1] text-emerald-400 transition-opacity" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/45 block">Avg Perf</span>
          <h3 className="text-2xl font-black text-emerald-400 glow-text-emerald leading-none mt-1">
            {trainingStats?.avgPerformance ?? "—"}
          </h3>
          <p className="text-[8px] font-bold text-emerald-500/40 uppercase pt-2 border-t border-emerald-500/10 mt-2">
            &gt; MEAN LEVEL RATING
          </p>
        </div>
      </m.div>

      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#060a08]/60 p-4 transition-all duration-300 hover:border-emerald-500/40 group h-full">
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.1]" />
          <Sparkles className="absolute top-4 right-4 size-10 opacity-[0.03] group-hover:opacity-[0.1] text-amber-400 transition-opacity" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/45 block">Best Perf</span>
          <h3 className="text-2xl font-black text-amber-400 glow-text-amber leading-none mt-1">
            {trainingStats?.bestPerformance ?? "—"}
          </h3>
          <p className="text-[8px] font-bold text-emerald-500/40 uppercase pt-2 border-t border-emerald-500/10 mt-2">
            &gt; PERSONAL RECORD
          </p>
        </div>
      </m.div>
    </div>
  );
}

interface AchievementsPanelProps {
  achievements: Array<{
    id: string;
    name: string;
    desc: string;
    icon: any;
    unlocked: boolean;
    color: string;
  }>;
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  return (
    <div className="font-mono text-emerald-400 w-full space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider">SYS.ACHIEVEMENTS // EARNED NODES</span>
        </div>
        <span className="text-[10px] tracking-widest font-black uppercase text-emerald-500/50">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED_NODES
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <m.div
              key={badge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className={cn(
                  "flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 relative overflow-hidden min-h-[120px] font-mono",
                  badge.unlocked
                    ? "border-emerald-500/25 bg-emerald-950/5 hover:border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.03)]"
                    : "border-emerald-500/10 bg-transparent opacity-30 select-none border-dashed"
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={cn(
                    "p-2 rounded border relative",
                    badge.unlocked ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "bg-transparent border-emerald-500/10 text-emerald-500/30"
                  )}>
                    <Icon className="size-4 animate-pulse" />
                    {badge.unlocked && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
                      </span>
                    )}
                  </div>

                  {!badge.unlocked ? (
                    <span className="text-[7px] font-bold text-emerald-500/30 uppercase tracking-widest">
                      [ NODE_OFFLINE ]
                    </span>
                  ) : (
                    <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-widest glow-text-emerald">
                      [ NODE_ACTIVE ]
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className={cn("text-xs font-black uppercase tracking-wider leading-none", badge.unlocked ? "text-emerald-400" : "text-emerald-500/30")}>
                    {badge.name}
                  </h4>
                  <p className={cn("text-[9px] mt-1.5 leading-tight font-medium", badge.unlocked ? "text-emerald-500/70" : "text-emerald-500/20")}>
                    {badge.desc}
                  </p>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

interface ActivityLogsPanelProps {
  recentSessions: any[];
}

export function ActivityLogsPanel({ recentSessions }: ActivityLogsPanelProps) {
  return (
    <div className="font-mono text-emerald-400 w-full space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-emerald-400" />
          <span className="font-semibold tracking-wider">SYS.ACTIVITY_LOGS // RUN DIAGNOSTICS</span>
        </div>
        <Link
          href="/statistics"
          className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:glow-text-emerald flex items-center gap-1"
        >
          [ EXPLORE ALL LOGS ] <ArrowRight className="size-3" />
        </Link>
      </div>
      
      <div className="divide-y divide-emerald-500/10">
        {recentSessions.length > 0 ? recentSessions.map((session) => {
          const solved = session.problems.filter(isTrainingProblemCountedSolved).length;
          const total = session.problems.length;
          const mode = session.trainingMode ?? "training";
          return (
            <div key={session._id} className="flex items-center justify-between px-2 py-3 hover:bg-emerald-950/5 transition-colors text-xs text-emerald-500/80">
              <div className="flex items-center gap-3 min-w-0">
                <span className={cn(
                  "size-2 rounded-full shrink-0 animate-pulse",
                  solved > 0 ? "bg-emerald-500" : "bg-emerald-950 border border-emerald-500/25"
                )} />
                <div className="min-w-0">
                  <span className="font-bold text-emerald-300 capitalize truncate block">
                    &gt; {mode} Run Diagnostic
                  </span>
                  <span className="text-[9px] text-emerald-500/40">
                    {new Date(session.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="text-[10px] font-mono text-emerald-500/60 tabular-nums">
                  ACCURACY: {solved}/{total}
                </span>
                <span className="text-[10px] font-black text-emerald-400 glow-text-emerald tabular-nums w-12 text-right">
                  PERF_{session.performance ?? "—"}
                </span>
              </div>
            </div>
          );
        }) : (
          <div className="px-5 py-8 text-center space-y-3">
            <p className="text-xs text-emerald-500/40">[NO DIAGNOSTIC SESSION LOGS FOUND]</p>
            <Button asChild variant="outline" className="h-9 rounded border border-emerald-500/35 bg-[#060a08] text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 active:scale-[0.98] transition-all font-mono">
              <Link href="/training">[ RUN FIRST_SESSION.EXE ]</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

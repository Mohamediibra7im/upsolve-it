"use client";

import Link from "next/link";
import {m} from "framer-motion";
import {Card} from "@/components/ui/card";
import {
  CheckCircle2,
  Target,
  Flame,
  Zap,
  Crown,
  ChevronRight,
} from "lucide-react";
import {cn} from "@/lib/utils";

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

type DashboardStreaksProps = {
  streaks: StreakPayload | undefined;
  roadmapRank: number;
};

export default function DashboardStreaks({streaks, roadmapRank}: DashboardStreaksProps) {
  const streakItems = [
    {
      label: "Training Streak",
      value: streaks?.trainingStreak ?? 0,
      icon: Zap,
      color: "text-amber-400 glow-text-amber",
      tag: "TRAIN_STRK",
      ledColor: "bg-amber-400",
    },
    {
      label: "Upsolve Streak",
      value: streaks?.upsolveStreak ?? 0,
      icon: Target,
      color: "text-cyan-400 glow-text-cyan",
      tag: "UPSLV_STRK",
      ledColor: "bg-cyan-400",
    },
    {
      label: "Best Streak",
      value: streaks?.bestStreak ?? 0,
      icon: Flame,
      color: "text-orange-400 glow-text-amber",
      tag: "PEAK_STRK",
      ledColor: "bg-orange-500",
    },
    {
      label: "Consistency",
      value: streaks != null ? `${streaks.consistencyScore}%` : "—",
      icon: CheckCircle2,
      color: "text-emerald-400 glow-text-emerald",
      tag: "CON_INDEX",
      ledColor: "bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 font-mono">
      {/* Streaks */}
      {streakItems.map((s, i) => (
        <m.div
          key={s.label}
          initial={{opacity: 0, y: 15}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3 + i * 0.05}}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] text-emerald-400 p-0 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group h-full">
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
            
            {/* Card Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
              <span>SYS.STREAK.0{i + 1}</span>
              <span className="font-bold opacity-60">{s.tag}</span>
            </div>

            <div className="p-4 sm:p-5 relative z-10 space-y-3">
              <s.icon
                className={cn(
                  "absolute top-8 right-4 size-10 opacity-[0.05] group-hover:opacity-[0.12] transition-opacity",
                  s.color,
                )}
              />
              
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/50">
                  {s.label}
                </p>
                <h4 className={cn("text-2xl font-black tracking-tight tabular-nums leading-none", s.color)}>
                  {s.value}
                </h4>
              </div>

              {/* Status LED indicator */}
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-500/10 text-[8px] font-bold text-emerald-500/40 select-none">
                <span className={cn("size-2 rounded-full animate-pulse shadow-sm", s.ledColor)} />
                <span>TELEMETRY_FEED_OK</span>
              </div>
            </div>
          </Card>
        </m.div>
      ))}

      {/* Leaderboard Rank Card */}
      <m.div
        initial={{opacity: 0, y: 15}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.5}}
        className="col-span-2 lg:col-span-1"
      >
        <Link href="/leaderboard">
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/35 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] text-emerald-400 p-0 hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 group cursor-pointer h-full">
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
            
            {/* Card Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
              <span>SYS.RANKINGS</span>
              <span className="font-bold opacity-60 text-emerald-400">LEADERBOARD</span>
            </div>

            <div className="p-4 sm:p-5 relative z-10 space-y-3">
              <Crown className="absolute top-8 right-4 size-10 opacity-[0.06] group-hover:opacity-[0.15] text-amber-400 transition-opacity" />
              
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/50">
                  Global Rank
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-black text-emerald-500/40">#</span>
                  <h4 className="text-2xl font-black tracking-tight text-emerald-400 glow-text-emerald tabular-nums leading-none">
                    {roadmapRank || "—"}
                  </h4>
                </div>
              </div>

              {/* Navigation trigger button style */}
              <div className="text-[9px] font-bold text-emerald-400 uppercase pt-2 border-t border-emerald-500/10 flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                [ VIEW RANKINGS.DB ] <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Card>
        </Link>
      </m.div>
    </div>
  );
}


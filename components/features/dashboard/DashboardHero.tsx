"use client";

import Link from "next/link";
import {m} from "framer-motion";
import {Button} from "@/components/ui/button";
import {
  RefreshCw,
  Users,
  Zap,
  TrendingUp,
} from "lucide-react";
import {cn} from "@/lib/utils";

type DashboardHeroProps = {
  user: any;
  roadmapXp: number;
  xpLevel: number;
  xpProgress: number;
  xpToNext: number;
  xpTitle: string;
  friendRequestCount: number;
  isSyncing: boolean;
  onSync: () => void;
};

export default function DashboardHero({
  user,
  roadmapXp,
  xpLevel,
  xpProgress,
  xpToNext,
  xpTitle,
  friendRequestCount,
  isSyncing,
  onSync,
}: DashboardHeroProps) {
  return (
    <m.section
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.6}}
      className="relative overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-[#060a08] shadow-[0_0_30px_rgba(16,185,129,0.08)] text-emerald-400 font-mono"
    >
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.15]" />
      <div className="terminal-scanline-sweep" />

      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-500/15 bg-[#0b120f] select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-[#ef4444]/80 border border-[#ef4444]/30" />
            <div className="size-3 rounded-full bg-[#eab308]/80 border border-[#eab308]/30" />
            <div className="size-3 rounded-full bg-[#22c55e]/80 border border-[#22c55e]/30" />
          </div>
          <span className="ml-3 font-semibold tracking-wider">guest@upsolve: ~/profile_telemetry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] tracking-widest font-black uppercase text-emerald-500/50">SYS_OPERATIONAL</span>
        </div>
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 space-y-6">
        {/* Terminal diagnostic header */}
        <div className="space-y-1 bg-black/40 p-4 border border-emerald-500/10 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-500/60 text-xs">
            <span>guest@upsolve.it:~$</span>
            <span className="text-emerald-400 font-bold">./fetch_diagnostics.sh --id={user.codeforcesHandle}</span>
          </div>
          <div className="text-[10px] text-emerald-500/40 font-mono leading-relaxed">
            [INFO] CONNECTING TO CODEFORCES API... SUCCESS<br />
            [INFO] DECODING USER PROFILE TELEMETRY... COMPLETE
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: User Info + XP Ring */}
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 min-w-0">
            {/* XP Ring formatted as Radar Grid */}
            <div className="relative shrink-0 select-none">
              <svg
                viewBox="0 0 120 120"
                className="size-24 sm:size-28 -rotate-90"
              >
                {/* Background grid circles */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="6" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="60" cy="60" r="32" fill="none" stroke="rgba(16, 185, 129, 0.03)" strokeWidth="1" strokeDasharray="2 2" />
                {/* Progress arc */}
                <m.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="url(#xpGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{strokeDashoffset: 2 * Math.PI * 52}}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 52 * (1 - xpProgress / 100),
                  }}
                  transition={{duration: 1.2, ease: "easeOut"}}
                />
                <defs>
                  <linearGradient
                    id="xpGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Level number inside ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                <span className="text-[8px] font-black tracking-[0.2em] text-emerald-500/50">
                  LVL
                </span>
                <span className="text-3xl font-black text-emerald-400 glow-text-emerald leading-none tabular-nums">
                  {xpLevel}
                </span>
              </div>
            </div>

            {/* User details */}
            <div className="min-w-0 space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {xpTitle}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-none truncate text-emerald-400 glow-text-emerald blink-cursor">
                {user.codeforcesHandle}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1.5 text-xs text-emerald-500/75">
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5 text-emerald-400" />
                  <span>XP:</span>
                  <span className="font-bold text-emerald-300 tabular-nums">
                    {roadmapXp.toLocaleString()}
                  </span>
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-emerald-400" />
                  <span>NEXT_LVL:</span>
                  <span className="font-bold text-emerald-300 tabular-nums">
                    {xpToNext}
                  </span>
                  <span className="text-[10px] opacity-50">XP NEEDED</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-3">
            <Button
              onClick={onSync}
              disabled={isSyncing}
              variant="outline"
              className="h-10 rounded border border-emerald-500/35 bg-[#060a08] text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 active:scale-[0.98] transition-all font-mono"
            >
              <RefreshCw
                className={cn("mr-2 size-3.5", isSyncing && "animate-spin")}
              />
              {isSyncing ? "SYNC_RUNNING..." : "[ SYNC ]"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-10 rounded border border-emerald-500/35 bg-[#060a08] text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 active:scale-[0.98] transition-all relative font-mono"
            >
              <Link href="/friends" className="flex items-center gap-2">
                <Users className="size-3.5" />
                [ FRIENDS ]
                {friendRequestCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded bg-red-950 border border-red-500 px-1 text-[9px] font-black text-red-400 animate-pulse">
                    {friendRequestCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all font-mono"
            >
              <Link href="/training">[ START_TRAINING.EXE ]</Link>
            </Button>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-emerald-500/50">
            <span>LEVEL_CWR: {xpLevel}</span>
            <span>SECTOR_XP_PROGRESS: {Math.round(xpProgress)}%</span>
            <span>LEVEL_NEXT: {xpLevel + 1}</span>
          </div>
          <div className="h-5 w-full bg-emerald-950/20 border border-emerald-500/20 rounded p-0.5 overflow-hidden flex items-center">
            <m.div
              initial={{width: 0}}
              animate={{width: `${xpProgress}%`}}
              transition={{duration: 1.2, ease: "easeOut"}}
              className="h-full bg-emerald-500 rounded-sm relative flex items-center justify-end overflow-hidden"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px)'
              }}
            >
              {/* Shiny overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </m.div>
          </div>
        </div>
      </div>
    </m.section>
  );
}


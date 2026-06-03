"use client";

import {useState} from "react";
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
      className="relative overflow-hidden rounded-[2.5rem] border border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl"
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-20 -top-20 size-60 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -right-20 -bottom-20 size-60 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 p-8 sm:p-10 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          {/* Left: User Info + XP Ring */}
          <div className="flex items-center gap-6 sm:gap-8 flex-1 min-w-0">
            {/* XP Ring */}
            <div className="relative shrink-0">
              <svg
                viewBox="0 0 120 120"
                className="size-24 sm:h-28 sm:w-28 -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted/20 dark:text-white/5"
                />
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
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Level number inside ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 dark:text-muted-foreground/60">
                  LVL
                </span>
                <span className="text-2xl sm:text-3xl font-black text-primary tabular-nums leading-none">
                  {xpLevel}
                </span>
              </div>
            </div>

            {/* User details */}
            <div className="min-w-0 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                {xpTitle}
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-none truncate">
                {user.codeforcesHandle}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  <span className="font-black text-foreground tabular-nums">
                    {roadmapXp.toLocaleString()}
                  </span>{" "}
                  XP
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span className="font-black text-foreground tabular-nums">
                    {xpToNext}
                  </span>{" "}
                  to next level
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
            <Button
              onClick={onSync}
              disabled={isSyncing}
              variant="outline"
              className="h-11 px-5 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[9px] hover:bg-card/40 transition-all"
            >
              <RefreshCw
                className={cn("mr-2 size-3.5", isSyncing && "animate-spin")}
              />
              {isSyncing ? "Syncing..." : "Sync"}
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[9px] hover:bg-card/40 transition-all relative"
            >
              <Link href="/friends" className="flex items-center gap-2">
                <Users className="size-3.5" />
                Friends
                {friendRequestCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-background">
                    {friendRequestCount > 9 ? "9+" : friendRequestCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 px-6 rounded-2xl bg-primary font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
            >
              <Link href="/training">Start Training</Link>
            </Button>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/50">
            <span>Level {xpLevel}</span>
            <span>{Math.round(xpProgress)}%</span>
            <span>Level {xpLevel + 1}</span>
          </div>
          <div className="h-2 w-full bg-muted/60 dark:bg-white/5 rounded-full overflow-hidden border border-border/40 dark:border-white/5">
            <m.div
              initial={{width: 0}}
              animate={{width: `${xpProgress}%`}}
              transition={{duration: 1, ease: "easeOut"}}
              className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            />
          </div>
        </div>
      </div>
    </m.section>
  );
}

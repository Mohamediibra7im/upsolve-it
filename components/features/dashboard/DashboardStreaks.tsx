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
      color: "text-amber-400",
    },
    {
      label: "Upsolve Streak",
      value: streaks?.upsolveStreak ?? 0,
      icon: Target,
      color: "text-sky-400",
    },
    {
      label: "Best Streak",
      value: streaks?.bestStreak ?? 0,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Consistency",
      value:
        streaks != null ? `${streaks.consistencyScore}%` : "—",
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Streaks */}
      {streakItems.map((s, i) => (
        <m.div
          key={s.label}
          initial={{opacity: 0, y: 15}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3 + i * 0.05}}
        >
          <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[1.8rem] p-5 hover:bg-card/80 dark:hover:bg-card/30 transition-all duration-300 group overflow-hidden relative h-full">
            <s.icon
              className={cn(
                "absolute -top-1 -right-1 size-14 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity",
                s.color,
              )}
            />
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 mb-3">
                {s.label}
              </p>
              <h4 className="text-2xl font-black tracking-tight tabular-nums">
                {s.value}
              </h4>
            </div>
          </Card>
        </m.div>
      ))}

      {/* Leaderboard Rank Card */}
      <m.div
        initial={{opacity: 0, y: 15}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.5}}
      >
        <Link href="/leaderboard">
          <Card className="border-primary/30 dark:border-primary/20 bg-gradient-to-br from-primary/5 via-card/70 dark:via-card/20 to-emerald-500/5 backdrop-blur-xl rounded-[1.8rem] p-5 hover:border-primary/40 transition-all duration-300 group overflow-hidden relative cursor-pointer h-full">
            <Crown className="absolute -top-1 -right-1 size-14 opacity-[0.06] group-hover:opacity-[0.12] text-amber-400 transition-opacity" />
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 dark:text-primary/60 mb-3">
                Leaderboard
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[9px] font-black text-muted-foreground/70 dark:text-muted-foreground/50">
                  #
                </span>
                <h4 className="text-2xl font-black tracking-tight text-primary tabular-nums">
                  {roadmapRank || "—"}
                </h4>
              </div>
              <p className="text-[9px] font-bold text-primary/70 dark:text-primary/40 uppercase mt-0.5 flex items-center gap-1 group-hover:text-primary/90 transition-colors">
                View Rankings <ChevronRight className="size-3" />
              </p>
            </div>
          </Card>
        </Link>
      </m.div>
    </div>
  );
}

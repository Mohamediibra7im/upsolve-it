"use client";

import Link from "next/link";
import { ArrowUpRight, Flame, Target, Trophy, CircleCheck } from "lucide-react";

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

export default function DashboardStreaks({ streaks, roadmapRank }: DashboardStreaksProps) {
  const streakItems = [
    { label: "Training streak", value: streaks?.trainingStreak ?? 0, unit: "days", icon: Flame },
    { label: "Upsolve streak", value: streaks?.upsolveStreak ?? 0, unit: "days", icon: Target },
    { label: "Longest streak", value: streaks?.bestStreak ?? 0, unit: "days", icon: Trophy },
    { label: "Consistency", value: streaks != null ? `${streaks.consistencyScore}%` : "—", unit: "", icon: CircleCheck },
  ];

  return (
    <section aria-labelledby="consistency-title" className="rounded-3xl border border-border bg-card p-5 font-sans sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="consistency-title" className="font-heading text-lg font-medium tracking-tight text-foreground">Small steps. Lasting progress.</h2>
          <p className="mt-1 text-xs text-muted-foreground">Keep showing up. Your consistency makes the difference.</p>
        </div>
        <Link href="/leaderboard" className="group flex items-center gap-3 rounded-full border border-border bg-background/30 px-3.5 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Global rank <span className="font-semibold text-foreground tabular-nums">{roadmapRank ? `#${roadmapRank}` : "—"}</span>
          <ArrowUpRight className="size-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        {streakItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 sm:gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.07] text-primary sm:size-11">
              <item.icon className="size-[18px]" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground sm:text-xs">{item.label}</p>
              <p className="mt-1 font-heading text-2xl font-medium leading-none tracking-tight text-foreground tabular-nums">
                {item.value} <span className="font-sans text-xs font-normal tracking-normal text-muted-foreground">{item.unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

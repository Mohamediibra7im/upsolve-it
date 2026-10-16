"use client";

import { m, useReducedMotion } from "framer-motion";
import { CheckCircle2, Trophy, TrendingUp, Layers3 } from "lucide-react";
import type { ElementType } from "react";
import type { User } from "@/types/User";

type StatItem = {
  label: string;
  value: string | number;
  sub: string;
  icon: ElementType;
};

type DashboardStatCardsProps = {
  stats: StatItem[];
};

export default function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section aria-label="Your performance" className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border bg-card font-sans lg:grid-cols-4">
      {stats.map((stat, i) => (
        <m.div
          key={stat.label}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="border-border p-5 odd:border-r sm:p-6 [&:nth-child(n+3)]:border-t lg:border-r lg:last:border-r-0 lg:[&:nth-child(n+3)]:border-t-0"
        >
          <div className="mb-5 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</p>
            <stat.icon className="hidden size-4 text-muted-foreground/70 sm:block" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <p className="font-heading text-3xl font-medium leading-none tracking-tight text-foreground tabular-nums sm:text-4xl">
            {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
          </p>
          <p className="mt-3 text-xs capitalize text-muted-foreground">{stat.sub}</p>
        </m.div>
      ))}
    </section>
  );
}

export function buildDashboardStats({
  user,
  totalSolved,
  roadmapProblemsSolved,
  historyLength,
  roadmapTopicsCompleted,
}: {
  user: User;
  totalSolved: number;
  roadmapProblemsSolved: number;
  historyLength: number;
  roadmapTopicsCompleted: number;
}): StatItem[] {
  return [
    { label: "Codeforces rating", value: user.rating || 0, sub: user.rank || "Newbie", icon: Trophy },
    { label: "Personal best", value: user.maxRating || 0, sub: user.maxRank || "Newbie", icon: TrendingUp },
    { label: "Problems solved", value: totalSolved, sub: `${roadmapProblemsSolved} from your roadmap`, icon: CheckCircle2 },
    { label: "Training sessions", value: historyLength, sub: `${roadmapTopicsCompleted} topics completed`, icon: Layers3 },
  ];
}

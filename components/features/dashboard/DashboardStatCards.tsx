"use client";

import {m} from "framer-motion";
import {Card} from "@/components/ui/card";
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  Flame,
} from "lucide-react";
import {cn} from "@/lib/utils";

type StatItem = {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  color: string;
  glow: string;
};

type DashboardStatCardsProps = {
  stats: StatItem[];
};

export default function DashboardStatCards({stats}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <m.div
          key={stat.label}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1 + i * 0.08}}
        >
          <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[1.8rem] p-5 hover:bg-card/80 dark:hover:bg-card/30 transition-all duration-300 group overflow-hidden relative h-full">
            <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.glow)} />
            <stat.icon
              className={cn(
                "absolute -top-2 -right-2 size-16 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity",
                stat.color,
              )}
            />
            <div className="relative z-10">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 mb-3">
                {stat.label}
              </p>
              <h4 className="text-3xl font-black tracking-tight mb-0.5 tabular-nums">
                {stat.value}
              </h4>
              <p className="text-[9px] font-bold text-muted-foreground/75 dark:text-muted-foreground/50 uppercase">
                {stat.sub}
              </p>
            </div>
          </Card>
        </m.div>
      ))}
    </div>
  );
}

// Pre-built stat factory for common dashboard usage
export function buildDashboardStats({
  user,
  totalSolved,
  roadmapProblemsSolved,
  historyLength,
  roadmapTopicsCompleted,
}: {
  user: any;
  totalSolved: number;
  roadmapProblemsSolved: number;
  historyLength: number;
  roadmapTopicsCompleted: number;
}): StatItem[] {
  return [
    {
      label: "Codeforces Rating",
      value: user.rating || 0,
      sub: user.rank || "Newbie",
      icon: Trophy,
      color: "text-amber-400",
      glow: "from-amber-500/10",
    },
    {
      label: "Max Rating",
      value: user.maxRating || 0,
      sub: user.maxRank || "Newbie",
      icon: Sparkles,
      color: "text-primary",
      glow: "from-primary/10",
    },
    {
      label: "Problems Solved",
      value: totalSolved,
      sub: `${roadmapProblemsSolved} via Roadmap`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      glow: "from-emerald-500/10",
    },
    {
      label: "Sessions",
      value: historyLength,
      sub: `${roadmapTopicsCompleted} topics done`,
      icon: Flame,
      color: "text-orange-400",
      glow: "from-orange-500/10",
    },
  ];
}

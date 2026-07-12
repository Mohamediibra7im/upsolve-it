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
  tag: string;
};

type DashboardStatCardsProps = {
  stats: StatItem[];
};

export default function DashboardStatCards({stats}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
      {stats.map((stat, i) => (
        <m.div
          key={stat.label}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1 + i * 0.08}}
        >
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] text-emerald-400 p-0 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group h-full">
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
            
            {/* Card Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
              <span>SYS.TELEMETRY.0{i + 1}</span>
              <span className="font-bold opacity-60">{stat.tag}</span>
            </div>

            <div className="p-4 sm:p-5 relative z-10 space-y-3">
              <stat.icon
                className={cn(
                  "absolute top-10 right-4 size-10 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity",
                  stat.color,
                )}
              />
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/50">
                  {stat.label}
                </p>
                <h4 className={cn("text-2xl sm:text-3xl font-black tracking-tight tabular-nums leading-none", stat.color)}>
                  {stat.value}
                </h4>
              </div>

              {/* Pixel Status Bar decoration */}
              <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-500/40 select-none">
                <span>STATUS:</span>
                <span className="text-emerald-400/80">ONLINE</span>
                <span className="ml-auto opacity-75 font-mono text-[7px]">
                  [■■■■■■■■□□]
                </span>
              </div>

              <p className="text-[9px] font-bold text-emerald-500/60 uppercase border-t border-emerald-500/10 pt-2 mt-1">
                &gt; {stat.sub}
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
      color: "text-amber-400 glow-text-amber",
      glow: "from-amber-500/10",
      tag: "CF_RATING",
    },
    {
      label: "Max Rating",
      value: user.maxRating || 0,
      sub: user.maxRank || "Newbie",
      icon: Sparkles,
      color: "text-emerald-400 glow-text-emerald",
      glow: "from-primary/10",
      tag: "CF_PEAK",
    },
    {
      label: "Problems Solved",
      value: totalSolved,
      sub: `${roadmapProblemsSolved} via Roadmap`,
      icon: CheckCircle2,
      color: "text-emerald-400 glow-text-emerald",
      glow: "from-emerald-500/10",
      tag: "SOLVED_DB",
    },
    {
      label: "Sessions",
      value: historyLength,
      sub: `${roadmapTopicsCompleted} topics done`,
      icon: Flame,
      color: "text-cyan-400 glow-text-cyan",
      glow: "from-orange-500/10",
      tag: "RUNS_LOGGED",
    },
  ];
}


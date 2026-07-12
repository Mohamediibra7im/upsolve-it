import { Layers } from "lucide-react";
import { formatMetric } from "@/app/(main)/statistics/page.client";

interface ModeStats {
  mode: string;
  label: string;
  sessions: number;
  totalProblems: number;
  solved: number;
  averagePerformance: number;
  bestPerformance: number;
  solvingRate: number;
}

const modeToExe: Record<string, string> = {
  ladder: "LADDER.EXE",
  speed: "SPEED.COM",
  contest: "CONTEST.BAT",
  weakness: "WEAKNESS.SYS",
  endurance: "ENDURE.BAT",
};

export default function ModeBreakdown({ statsByMode }: { statsByMode: ModeStats[] }) {
  if (statsByMode.length === 0) return null;

  return (
    <div className="font-mono text-emerald-400 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
        <Layers size={12} className="text-emerald-400" />
        <span>MODE_BREAKDOWN // STATS_BY_TRAINING_TYPE</span>
        <span className="flex-1 border-b border-emerald-500/10" />
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1fr_60px_70px_60px_60px_80px] items-center px-2 py-2 text-[8px] font-bold uppercase tracking-widest text-emerald-500/25 border-b border-emerald-500/10">
        <span>MODE_BINARY</span>
        <span className="text-center">SESS</span>
        <span className="text-center">AVG.PERF</span>
        <span className="text-center">BEST</span>
        <span className="text-center">RATE</span>
        <span className="text-right">SOLVED</span>
      </div>

      {/* Mode Rows */}
      <div className="divide-y divide-emerald-500/[0.07]">
        {statsByMode.map((m) => (
          <div
            key={m.mode}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_60px_70px_60px_60px_80px] items-center gap-3 md:gap-0 py-3 px-2 hover:bg-emerald-950/5 transition-all duration-200"
          >
            {/* Mode name */}
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {modeToExe[m.mode] ?? m.label.toUpperCase()}
              </span>
              <div className="md:hidden flex items-center gap-3 mt-1 text-[9px] text-emerald-500/30">
                <span>{m.sessions} sess</span>
                <span className="text-emerald-500/10">|</span>
                <span>avg: {m.solved > 0 ? formatMetric(m.averagePerformance) : "—"}</span>
                <span className="text-emerald-500/10">|</span>
                <span>{m.solvingRate}%</span>
              </div>
            </div>

            {/* Sessions (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-[10px] font-bold text-emerald-500/50 tabular-nums">{m.sessions}</span>
            </div>

            {/* Avg Performance (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-[10px] font-bold tabular-nums text-emerald-500/50">
                {m.solved > 0 ? formatMetric(m.averagePerformance) : "—"}
              </span>
            </div>

            {/* Best (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-[10px] font-bold tabular-nums text-emerald-500/50">
                {m.solved > 0 ? formatMetric(m.bestPerformance) : "—"}
              </span>
            </div>

            {/* Rate (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-[10px] font-bold tabular-nums text-emerald-300">{m.solvingRate}%</span>
            </div>

            {/* Solved / Total */}
            <div className="flex items-center justify-end">
              <span className="text-[10px] font-bold tabular-nums">
                {m.solved}<span className="text-emerald-500/30">/{m.totalProblems}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

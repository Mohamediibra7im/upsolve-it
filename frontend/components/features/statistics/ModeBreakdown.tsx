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
  ladder: "Ladder",
  speed: "Speed",
  contest: "Contest",
  weakness: "Weakness",
  endurance: "Endurance",
};

export default function ModeBreakdown({ statsByMode }: { statsByMode: ModeStats[] }) {
  if (statsByMode.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 font-sans text-foreground space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Layers size={12} className="text-primary" />
        <span>Progress by training mode</span>
        <span className="flex-1 border-b border-border" />
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[1.5fr_70px_100px_70px_80px_80px] items-center px-2 py-2 text-xs font-medium text-muted-foreground border-b border-border">
        <span>Mode</span>
        <span className="text-center">Sessions</span>
        <span className="text-center">Avg. performance</span>
        <span className="text-center">Best</span>
        <span className="text-center">Solve rate</span>
        <span className="text-right">Solved</span>
      </div>

      {/* Mode Rows */}
      <div className="divide-y divide-border">
        {statsByMode.map((m) => (
          <div
            key={m.mode}
            className="grid grid-cols-[1fr_auto] md:grid-cols-[1.5fr_70px_100px_70px_80px_80px] items-center gap-3 md:gap-0 py-3 px-2 hover:bg-card transition-all duration-200"
          >
            {/* Mode name */}
            <div>
              <span className="text-xs font-medium text-primary">
                {modeToExe[m.mode] ?? m.label}
              </span>
              <div className="md:hidden flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{m.sessions} sessions</span>
                <span className="text-muted-foreground">|</span>
                <span>avg: {m.solved > 0 ? formatMetric(m.averagePerformance) : "—"}</span>
                <span className="text-muted-foreground">|</span>
                <span>{m.solvingRate}%</span>
              </div>
            </div>

            {/* Sessions (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground tabular-nums">{m.sessions}</span>
            </div>

            {/* Avg Performance (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {m.solved > 0 ? formatMetric(m.averagePerformance) : "—"}
              </span>
            </div>

            {/* Best (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {m.solved > 0 ? formatMetric(m.bestPerformance) : "—"}
              </span>
            </div>

            {/* Rate (desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <span className="text-xs font-medium tabular-nums text-foreground">{m.solvingRate}%</span>
            </div>

            {/* Solved / Total */}
            <div className="flex items-center justify-end">
              <span className="text-xs font-medium tabular-nums">
                {m.solved}<span className="text-muted-foreground">/{m.totalProblems}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

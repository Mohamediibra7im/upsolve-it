import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Layers, Info } from "lucide-react";
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

export default function ModeBreakdown({ statsByMode }: { statsByMode: ModeStats[] }) {
  if (statsByMode.length === 0) return null;

  return (
    <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden w-full">
      <CardContent className="p-0">
        <div className="p-6 sm:p-8 border-b border-border/40 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <Layers className="size-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                Stats by training mode
              </h3>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1 max-w-2xl">
                Sessions are grouped by how you trained (ladder, speed,
                contest, etc.). Totals are per mode only. Average and best
                performance use sessions where you solved at least one
                problem in that mode.
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8 pt-2">
          <TooltipProvider delayDuration={200}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {statsByMode.map((m) => (
              <div
                key={m.mode}
                className="rounded-2xl border border-border/50 bg-background/40 backdrop-blur-sm p-5 space-y-4 hover:border-primary/25 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-black uppercase tracking-[0.15em]"
                  >
                    {m.label}
                  </Badge>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex size-5 items-center justify-center">
                      {m.solved === 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Why average and best performance are hidden for this mode"
                            >
                              <Info className="size-3.5" aria-hidden />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[260px] text-xs leading-relaxed"
                          >
                            Performance is hidden until you have at least one
                            solve in this mode. Stored session scores can still
                            reflect miss penalties.
                          </TooltipContent>
                        </Tooltip>
                      ) : null}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground tabular-nums">
                      {m.sessions}{" "}
                      {m.sessions === 1 ? "session" : "sessions"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Avg performance
                    </p>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {m.solved > 0
                        ? formatMetric(m.averagePerformance)
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Best
                    </p>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {m.solved > 0
                        ? formatMetric(m.bestPerformance)
                        : "-"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Solve rate
                    </p>
                    <p className="text-xl font-black tabular-nums text-primary">
                      {m.solvingRate}
                      <span className="text-sm font-black text-primary/80">
                        %
                      </span>
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Solved / tries
                    </p>
                    <p className="text-xl font-black tabular-nums text-foreground">
                      {m.solved}
                      <span className="text-sm font-semibold text-muted-foreground">
                        {" "}
                        / {m.totalProblems}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

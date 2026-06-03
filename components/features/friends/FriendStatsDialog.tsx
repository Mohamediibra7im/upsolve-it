"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  Clock,
  Loader2,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { UserTrainingStatsView } from "@/types/userTrainingStats";
import { cn } from "@/lib/utils";
import { formatAvgProblemRating } from "@/services/training/formatAvgProblemRating";

interface FriendStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userStats: UserTrainingStatsView | null;
}

export function FriendStatsDialog({
  open,
  onOpenChange,
  userStats,
}: Readonly<FriendStatsDialogProps>) {
  const handle = userStats?.user.codeforcesHandle ?? "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[150] flex max-h-[90vh] w-[95vw] max-w-xl flex-col overflow-hidden rounded-2xl border-border/60 bg-background p-0 shadow-xl sm:max-w-lg gap-0">
        {userStats ? (
          <>
            <div className="shrink-0 border-b border-border/60 bg-muted/30 px-6 py-6 sm:px-8">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Friend training stats
                </DialogTitle>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">{handle}</p>
                  <p className="text-sm font-normal text-muted-foreground">
                    {userStats.user.rank}
                    {" · "}
                    Rating {userStats.user.rating}
                    {userStats.user.maxRating > 0 && (
                      <>
                        {" · "}
                        Max {userStats.user.maxRating} ({userStats.user.maxRank})
                      </>
                    )}
                  </p>
                </div>
                <DialogDescription className="sr-only">
                  Training statistics for {handle}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Sessions",
                    value: userStats.stats.totalSessions,
                    icon: Activity,
                  },
                  {
                    label: "Solving rate",
                    value: `${userStats.stats.solvingRate}%`,
                    icon: Target,
                  },
                  {
                    label: "Avg performance",
                    value: userStats.stats.averagePerformance,
                    icon: Zap,
                  },
                  {
                    label: "Recent trend",
                    value:
                      (userStats.stats.recentTrend >= 0 ? "+" : "") +
                      userStats.stats.recentTrend,
                    icon: TrendingUp,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border/50 bg-card/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <item.icon className="size-4 shrink-0 opacity-70" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-lg font-semibold tabular-nums text-foreground",
                        item.label === "Recent trend" &&
                          (userStats.stats.recentTrend >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"),
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Star className="size-4 text-amber-500" />
                  Problems & upsolves
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Solved</dt>
                    <dd className="font-medium tabular-nums">
                      {userStats.stats.solvedProblems}/{userStats.stats.totalProblems}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Upsolves</dt>
                    <dd className="font-medium tabular-nums">
                      {userStats.stats.upsolvedSolvedCount}/{userStats.stats.upsolvedCount}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sessions (30d)</dt>
                    <dd className="font-medium tabular-nums">
                      {userStats.stats.recentSessions}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="min-w-0 shrink text-muted-foreground">
                      Avg problem rating
                    </dt>
                    <dd className="shrink-0 font-medium tabular-nums text-right">
                      {formatAvgProblemRating(userStats.stats.averageRating)}
                    </dd>
                  </div>
                </dl>
              </div>

              {userStats.trainings.length > 0 && (
                <div className="flex min-h-0 flex-col gap-2">
                  <p className="shrink-0 text-sm font-medium text-foreground">
                    Recent sessions
                  </p>
                  <section
                    className="relative max-h-[min(50vh,280px)] overflow-y-auto overscroll-y-contain rounded-lg border border-border/40 bg-muted/10 py-2 pl-2 pr-1 custom-scrollbar touch-pan-y"
                    tabIndex={0}
                    aria-label="Recent practice sessions, scrollable list"
                  >
                    <ul className="space-y-2 pr-1">
                      {userStats.trainings.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm"
                        >
                          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
                            <Calendar className="size-3.5 shrink-0" />
                            {new Date(t.startTime).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <span className="inline-flex items-center gap-1 text-xs opacity-80">
                              <Clock className="size-3 shrink-0" />
                              {Math.round((t.endTime - t.startTime) / 60000)} min
                            </span>
                          </span>
                          <span className="shrink-0 font-semibold tabular-nums text-primary">
                            {t.performance}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              )}
            </div>

            <DialogFooter className="shrink-0 border-t border-border/60 px-6 py-4 sm:px-8">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Friend training stats</DialogTitle>
            <DialogDescription className="sr-only">
              Loading statistics
            </DialogDescription>
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-16">
              <Loader2 className="size-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading stats…</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

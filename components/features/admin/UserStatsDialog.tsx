"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Target,
  TrendingUp,
  Loader2,
  Zap,
  Star,
  Activity,
  Calendar,
  Clock,
  Shield,
} from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import type { UserTrainingStatsView } from "@/types/userTrainingStats";
import { formatAvgProblemRating } from "@/services/training/formatAvgProblemRating";

interface UserStatsDialogProps {
  statsDialog: { open: boolean; userId: string | null };
  setStatsDialog: (dialog: { open: boolean; userId: string | null }) => void;
  userStats: UserTrainingStatsView | null;
  headerDescriptionPrefix?: string;
  closeButtonLabel?: string;
}

export function UserStatsDialog({
  statsDialog,
  setStatsDialog,
  userStats,
  headerDescriptionPrefix = "Analytical overview for",
  closeButtonLabel = "Close Profile",
}: Readonly<UserStatsDialogProps>) {
  const renderProgress = (percent: number) => (
    <div
      role="progressbar"
      aria-label="Completion"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, percent))}
      className="h-2 w-full overflow-hidden rounded-full bg-[#2b3031]"
    >
      <div
        className="h-full rounded-full bg-[#b5e3c4]"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );

  const upsolveRate =
    userStats && userStats.stats.upsolvedCount > 0
      ? (userStats.stats.upsolvedSolvedCount / userStats.stats.upsolvedCount) *
        100
      : 0;

  return (
    <Dialog
      open={statsDialog.open}
      onOpenChange={(open) =>
        !open && setStatsDialog({ open: false, userId: null })
      }
    >
      <DialogContent className="z-[150] max-w-5xl overflow-hidden rounded-[20px] border-[#2b3031] bg-[#191c1e] p-0 shadow-none flex flex-col font-sans text-[#b5e3c4] w-[calc(100vw-2rem)] max-h-[90dvh]">
        {userStats ? (
          <>
            {/* Header Section */}
            <div className="relative h-48 shrink-0 overflow-hidden bg-[#101214] border-b border-[#2b3031]">
              <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                <m.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 size-16 rounded-xl bg-[#191c1e] border border-[#2b3031] shadow-none flex items-center justify-center p-0 overflow-hidden shrink-0"
                >
                  <Avatar className="size-full rounded-[inherit] border-0"><AvatarImage src={userStats.user.avatar} alt={userStats.user.codeforcesHandle} /><AvatarFallback><BarChart className="size-10 text-[#b5e3c4]" /></AvatarFallback></Avatar>
                </m.div>

                <div className="space-y-1.5">
                  <DialogTitle className="text-xl font-medium text-[#f1f3ee] leading-none font-heading tracking-tight">
                    {userStats.user.codeforcesHandle}
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-[#929b98]">
                    {headerDescriptionPrefix} this member
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-[#101214] relative">
              {/* Core Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
                {[
                  {
                    label: "Current rating",
                    value: userStats.user.rating || 0,
                    icon: Star,
                    color: "text-amber-400",
                    bg: "border-amber-500/20 bg-amber-400/5",
                  },
                  {
                    label: "Best rating",
                    value: userStats.user.maxRating || 0,
                    icon: TrendingUp,
                    color: "text-[#b5e3c4]",
                    bg: "border-[#2b3031] bg-[#131715]",
                  },
                  {
                    label: "Sessions",
                    value: userStats.stats.totalSessions,
                    icon: Activity,
                    color: "text-[#b5e3c4]",
                    bg: "border-[#2b3031] bg-[#131715]",
                  },
                  {
                    label: "Rating trend",
                    value: `${userStats.stats.recentTrend >= 0 ? "+" : ""}${userStats.stats.recentTrend}`,
                    icon: Zap,
                    color:
                      userStats.stats.recentTrend >= 0
                        ? "text-[#b5e3c4]"
                        : "text-red-400",
                    bg:
                      userStats.stats.recentTrend >= 0
                        ? "border-[#2b3031] bg-[#131715]"
                        : "border-red-500/20 bg-red-400/5",
                  },
                ].map((stat, i) => (
                  <m.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="bg-[#191c1e] border-[#2b3031] rounded-[20px] p-5 shadow-sm hover:border-[#2b3031] transition-colors font-sans">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("p-1.5 border rounded-xl", stat.bg)}>
                          <stat.icon className={cn("size-3.5", stat.color)} />
                        </div>
                        <div className="text-xs font-medium text-[#929b98]">
                          {stat.label}
                        </div>
                      </div>
                      <div className="text-xl font-medium text-[#f1f3ee] tabular-nums">
                        {stat.value}
                      </div>
                    </Card>
                  </m.div>
                ))}
              </div>

              {/* Advanced Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
                {/* Performance Execution */}
                <Card className="lg:col-span-2 border-[#2b3031] bg-[#191c1e] rounded-[20px] overflow-hidden shadow-sm font-sans text-[#b5e3c4]">
                  <div className="px-5 py-4 border-b border-[#2b3031] bg-black/10 flex items-center justify-between">
                    <h3 className="text-base font-medium flex items-center gap-2 text-[#f1f3ee] font-heading tracking-tight">
                      <Target className="text-[#b5e3c4] size-3.5" />
                      Practice performance
                    </h3>
                    <div className="text-xs font-medium text-[#929b98]">
                      Training progress
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-medium text-[#929b98]">
                              Solve rate
                            </span>
                            <span className="text-lg font-medium text-[#f1f3ee]">
                              {userStats.stats.solvingRate}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {renderProgress(userStats.stats.solvingRate)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-[#101214] border border-[#2b3031]">
                            <div className="text-lg font-medium text-[#f1f3ee]">
                              {userStats.stats.solvedProblems}
                            </div>
                            <div className="text-xs font-medium text-[#929b98] mt-1">
                              Problems solved
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-[#101214] border border-[#2b3031]">
                            <div className="text-lg font-medium text-[#f1f3ee]">
                              {userStats.stats.totalProblems}
                            </div>
                            <div className="text-xs font-medium text-[#929b98] mt-1">
                              Assigned problems
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-medium text-[#929b98]">
                              Upsolve progress
                            </span>
                            <span className="text-lg font-medium text-[#f1f3ee]">
                              {userStats.stats.upsolvedSolvedCount}{" "}
                              <span className="text-xs text-[#929b98]">
                                / {userStats.stats.upsolvedCount}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {renderProgress(upsolveRate)}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#131715] border border-[#2b3031] flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-[#929b98] leading-none">
                              Target difficulty
                            </div>
                            <div className="text-sm font-medium text-[#f1f3ee] tabular-nums mt-1">
                              {formatAvgProblemRating(
                                userStats.stats.averageRating,
                              )}
                            </div>
                          </div>
                          <BarChart className="text-[#929b98] size-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Training Timeline */}
                <Card className="border-[#2b3031] bg-[#191c1e] rounded-[20px] overflow-hidden shadow-sm flex flex-col font-sans text-[#b5e3c4]">
                  <div className="px-5 py-4 border-b border-[#2b3031] bg-black/10 flex items-center justify-between">
                    <h3 className="text-base font-medium flex items-center gap-2 text-[#f1f3ee] font-heading tracking-tight">
                      <TrendingUp className="text-[#b5e3c4] size-3.5" />
                      Session history
                    </h3>
                  </div>
                  <CardContent className="p-0 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar">
                    {userStats.trainings.length > 0 ? (
                      <div className="divide-y divide-[#2b3031]">
                        {userStats.trainings.map((training, i) => (
                          <m.div
                            key={training.id}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.04 }}
                            className="p-4 hover:bg-[#b5e3c4]/[0.06] transition-colors group cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="size-10 rounded-xl bg-[#131715] border border-[#2b3031] flex items-center justify-center text-[#929b98] group-hover:text-[#b5e3c4]">
                                  <Calendar size={12} />
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-[#f1f3ee]">
                                    {new Date(
                                      training.startTime,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs font-medium text-[#929b98] flex items-center gap-1 mt-0.5">
                                    <Clock size={8} />
                                    {Math.round(
                                      (training.endTime - training.startTime) /
                                        60000,
                                    )}{" "}
                                    min
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-medium text-[#f1f3ee]">
                                  {training.performance}
                                </div>
                                <div className="text-xs font-medium text-[#929b98] mt-0.5">
                                  Score
                                </div>
                              </div>
                            </div>
                          </m.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 text-[#929b98]">
                        <Calendar size={24} className="text-[#929b98]" />
                        <p className="text-xs font-medium">
                          No Recent Activity
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="shrink-0 p-5 border-t border-[#2b3031] bg-black/10 flex flex-wrap gap-3 justify-between items-center px-5 sm:px-8 z-10 relative">
              <div className="text-xs font-medium text-[#929b98] flex items-center gap-1.5">
                <Shield size={10} className="text-[#929b98]" />
                Member profile
              </div>
              <Button
                onClick={() => setStatsDialog({ open: false, userId: null })}
                className="rounded-xl px-8 h-10 font-medium text-[13px] bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-sans transition-all border-transparent"
              >
                {closeButtonLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only font-heading tracking-tight">
              Loading member statistics
            </DialogTitle>
            <DialogDescription className="sr-only">
              Getting this member’s latest practice and progress.
            </DialogDescription>
            <div
              role="status"
              className="h-96 flex flex-col items-center justify-center space-y-4"
            >
              <div className="relative">
                <Loader2 className="size-10 animate-spin text-[#b5e3c4] relative z-10" />
              </div>
              <p className="text-xs font-medium text-[#929b98]">
                Fetching progress…
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

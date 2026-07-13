'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Shield
} from 'lucide-react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserTrainingStatsView } from '@/types/userTrainingStats';
import { formatAvgProblemRating } from '@/services/training/formatAvgProblemRating';

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
  headerDescriptionPrefix = 'Analytical overview for',
  closeButtonLabel = 'Close Profile',
}: Readonly<UserStatsDialogProps>) {
  // ASCII Progress blocks helper
  const renderAsciiProgress = (percent: number) => {
    const totalBlocks = 20;
    const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((percent / 100) * totalBlocks)));
    const emptyBlocks = totalBlocks - filledBlocks;
    return (
      <span className="font-mono text-emerald-400 select-none">
        {"["}
        <span className="text-emerald-400">{"█".repeat(filledBlocks)}</span>
        <span className="text-emerald-500/15">{"░".repeat(emptyBlocks)}</span>
        {"]"}
      </span>
    );
  };

  const upsolveRate = userStats && userStats.stats.upsolvedCount > 0 
    ? (userStats.stats.upsolvedSolvedCount / userStats.stats.upsolvedCount) * 100 
    : 0;

  return (
    <Dialog open={statsDialog.open} onOpenChange={(open) => !open && setStatsDialog({ open: false, userId: null })}>
      <DialogContent className="z-[150] w-[95vw] max-w-5xl max-h-[92vh] overflow-hidden rounded-none border-emerald-500/25 bg-[#060a08] p-0 shadow-2xl flex flex-col font-mono text-emerald-400">
        {userStats ? (
          <>
            {/* Header Section */}
            <div className="relative h-60 shrink-0 overflow-hidden bg-[#040604]/80 border-b border-emerald-500/15">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03]" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                <m.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-4 size-16 rounded-none bg-[#060a08] border border-emerald-500/20 shadow-xl flex items-center justify-center p-0 overflow-hidden shrink-0"
                >
                  {userStats.user.avatar ? (
                    <Image src={userStats.user.avatar} alt="" width={64} height={64} unoptimized className="size-full object-cover" />
                  ) : (
                    <BarChart className="size-8 text-emerald-400" />
                  )}
                </m.div>
                
                <div className="space-y-1.5">
                  <DialogTitle className="text-xl font-bold tracking-widest text-emerald-300 uppercase leading-none">
                    {userStats.user.codeforcesHandle}
                  </DialogTitle>
                  <DialogDescription className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">
                    {headerDescriptionPrefix} Platform Personnel
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 bg-[#040604] relative">
              <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none" />
              
              {/* Core Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10 relative">
                {[
                  { label: "CURRENT_RATING", value: userStats.user.rating || 0, icon: Star, color: "text-amber-400", bg: "border-amber-500/20 bg-amber-955/10" },
                  { label: "MAX_RATING", value: userStats.user.maxRating || 0, icon: TrendingUp, color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-955/10" },
                  { label: "TOTAL_SESSIONS", value: userStats.stats.totalSessions, icon: Activity, color: "text-emerald-400", bg: "border-emerald-500/20 bg-emerald-955/10" },
                  { label: "TREND_INDICATOR", value: `${userStats.stats.recentTrend >= 0 ? '+' : ''}${userStats.stats.recentTrend}`, icon: Zap, color: userStats.stats.recentTrend >= 0 ? "text-emerald-400" : "text-red-400", bg: userStats.stats.recentTrend >= 0 ? "border-emerald-500/20 bg-emerald-955/10" : "border-red-500/20 bg-red-955/10" }
                ].map((stat, i) => (
                  <m.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Card className="bg-[#060a08]/30 border-emerald-500/15 rounded-none p-5 shadow-sm hover:border-emerald-500/30 transition-colors font-mono">
                      <div className="flex items-center justify-between mb-3">
                        <div className={cn("p-1.5 border rounded-none", stat.bg)}>
                          <stat.icon className={cn("size-3.5", stat.color)} />
                        </div>
                        <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest">{stat.label}</div>
                      </div>
                      <div className="text-xl font-bold tracking-wider text-emerald-300 tabular-nums">{stat.value}</div>
                    </Card>
                  </m.div>
                ))}
              </div>

              {/* Advanced Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
                {/* Performance Execution */}
                <Card className="lg:col-span-2 border-emerald-500/15 bg-[#060a08]/30 rounded-none overflow-hidden shadow-sm font-mono text-emerald-400">
                  <div className="px-5 py-4 border-b border-emerald-500/15 bg-black/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-emerald-300">
                      <Target className="text-emerald-400 size-3.5" />
                      TACTICAL_PERFORMANCE_METRICS
                    </h3>
                    <div className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-widest">EFFICIENCY.SYS</div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40">SOLVING_PRECISION</span>
                            <span className="text-lg font-bold text-emerald-300">{userStats.stats.solvingRate}%</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            {renderAsciiProgress(userStats.stats.solvingRate)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-none bg-[#040604]/50 border border-emerald-500/10">
                            <div className="text-lg font-bold text-emerald-300">{userStats.stats.solvedProblems}</div>
                            <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 mt-1">SOLVED_PROBLEMS</div>
                          </div>
                          <div className="p-3 rounded-none bg-[#040604]/50 border border-emerald-500/10">
                            <div className="text-lg font-bold text-emerald-300">{userStats.stats.totalProblems}</div>
                            <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 mt-1">ASSIGNED_TASKS</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40">UPSOLVE_COMMITMENT</span>
                            <span className="text-lg font-bold text-emerald-300">{userStats.stats.upsolvedSolvedCount} <span className="text-xs text-emerald-500/40">/ {userStats.stats.upsolvedCount}</span></span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px]">
                            {renderAsciiProgress(upsolveRate)}
                          </div>
                        </div>

                        <div className="p-4 rounded-none bg-emerald-950/5 border border-emerald-500/15 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 leading-none">DIFFICULTY_TARGET</div>
                            <div className="text-sm font-bold text-emerald-300 tabular-nums mt-1">
                              {formatAvgProblemRating(userStats.stats.averageRating)}
                            </div>
                          </div>
                          <BarChart className="text-emerald-500/30 size-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Training Timeline */}
                <Card className="border-emerald-500/15 bg-[#060a08]/30 rounded-none overflow-hidden shadow-sm flex flex-col font-mono text-emerald-400">
                  <div className="px-5 py-4 border-b border-emerald-500/15 bg-black/10 flex items-center justify-between">
                    <h3 className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 text-emerald-300">
                      <TrendingUp className="text-emerald-400 size-3.5" />
                      SESSION_HISTORY
                    </h3>
                  </div>
                  <CardContent className="p-0 flex-1 overflow-y-auto max-h-[220px] custom-scrollbar">
                    {userStats.trainings.length > 0 ? (
                      <div className="divide-y divide-emerald-500/[0.08]">
                        {userStats.trainings.map((training, i) => (
                          <m.div 
                            key={training.id}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.04 }}
                            className="p-4 hover:bg-emerald-500/[0.02] transition-colors group cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="size-7 rounded-none bg-emerald-950/10 border border-emerald-500/15 flex items-center justify-center text-emerald-500/50 group-hover:text-emerald-400">
                                  <Calendar size={12} />
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-emerald-300">
                                    {new Date(training.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                                  </div>
                                  <div className="text-[8px] font-bold text-emerald-500/25 flex items-center gap-1 mt-0.5 uppercase">
                                    <Clock size={8} />
                                    {Math.round((training.endTime - training.startTime) / 60000)}M_ELAPSED
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-emerald-300">{training.performance}</div>
                                <div className="text-[7px] font-bold uppercase tracking-widest text-emerald-500/25 mt-0.5">SCORE</div>
                              </div>
                            </div>
                          </m.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-30">
                        <Calendar size={24} className="text-emerald-500/40" />
                        <p className="text-[8px] font-bold uppercase tracking-widest">No Recent Activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Footer with Actions */}
            <div className="shrink-0 p-5 border-t border-emerald-500/15 bg-black/10 flex justify-between items-center px-8 z-10 relative">
              <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest flex items-center gap-1.5">
                <Shield size={10} className="text-emerald-500/40" />
                ACCESS_AUTHORIZED_PROFILE
              </div>
              <Button 
                onClick={() => setStatsDialog({ open: false, userId: null })}
                className="rounded-none px-8 h-8 font-bold uppercase tracking-widest text-[9px] bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all border-transparent"
              >
                [ {closeButtonLabel.toUpperCase().replace(' ', '_')} ]
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">LOADING_USER_TELEMETRY</DialogTitle>
            <div className="h-96 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="size-8 animate-spin text-emerald-400 relative z-10" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500/40 animate-pulse">
                SYNCHRONIZING_DATABASE...
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

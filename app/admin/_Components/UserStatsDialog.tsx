'use client';

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
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserTrainingStatsView } from '@/types/userTrainingStats';
import { formatAvgProblemRating } from '@/services/training/formatAvgProblemRating';

interface UserStatsDialogProps {
  statsDialog: { open: boolean; userId: string | null };
  setStatsDialog: (dialog: { open: boolean; userId: string | null }) => void;
  userStats: UserTrainingStatsView | null;
  /** Dialog header title (default: admin copy) */
  headerTitle?: string;
  /** Shown before the friend’s handle in the subtitle (default: admin copy) */
  headerDescriptionPrefix?: string;
  closeButtonLabel?: string;
}

export function UserStatsDialog({ 
  statsDialog, 
  setStatsDialog, 
  userStats,
  headerTitle = 'User Performance Profile',
  headerDescriptionPrefix = 'Analytical overview for',
  closeButtonLabel = 'Close Profile',
}: Readonly<UserStatsDialogProps>) {
  return (
    <Dialog open={statsDialog.open} onOpenChange={(open) => !open && setStatsDialog({ open: false, userId: null })}>
      <DialogContent className="z-[150] w-[95vw] max-w-5xl max-h-[92vh] overflow-hidden rounded-[2.5rem] border-border bg-background p-0 shadow-2xl flex flex-col">
        {userStats ? (
          <>
            {/* Header Section with Immersive Background */}
            <div className="relative h-72 shrink-0 overflow-hidden bg-card/30 border-b border-border">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] animate-pulse" />
                <div className="absolute -bottom-[30%] -right-[10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
              </div>

              <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 h-20 w-20 rounded-2xl bg-background border border-border shadow-2xl flex items-center justify-center p-0 overflow-hidden"
                >
                  {userStats.user.avatar ? (
                    <img src={userStats.user.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <BarChart className="h-10 w-10 text-primary" />
                  )}
                </motion.div>
                
                <div className="space-y-2">
                  <DialogTitle className="text-4xl font-black tracking-tight text-foreground leading-none">
                    {userStats.user.codeforcesHandle}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80">
                    {headerDescriptionPrefix} Platform Personnel
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-10 space-y-10 custom-scrollbar bg-background">
              {/* Core Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Current Rating", value: userStats.user.rating || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { label: "Max Rating", value: userStats.user.maxRating || 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Total Sessions", value: userStats.stats.totalSessions, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Trend Indicator", value: `${userStats.stats.recentTrend >= 0 ? '+' : ''}${userStats.stats.recentTrend}`, icon: Zap, color: userStats.stats.recentTrend >= 0 ? "text-emerald-500" : "text-red-500", bg: userStats.stats.recentTrend >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" }
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="bg-card/40 border-border rounded-2xl p-6 shadow-sm group hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 rounded-lg border border-border/50", stat.bg)}>
                          <stat.icon className={cn("h-4 w-4", stat.color)} />
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{stat.label}</div>
                      </div>
                      <div className="text-3xl font-black tracking-tight text-foreground tabular-nums">{stat.value}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Advanced Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Performance Execution */}
                <Card className="lg:col-span-2 border-border bg-card/20 rounded-3xl overflow-hidden shadow-sm">
                  <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-2">
                      <Target className="text-primary h-4 w-4" />
                      Tactical Performance
                    </h3>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Efficiency Metrics</div>
                  </div>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Solving Precision</span>
                            <span className="text-3xl font-black text-foreground">{userStats.stats.solvingRate}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${userStats.stats.solvingRate}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-background/50 border border-border">
                            <div className="text-2xl font-black text-foreground">{userStats.stats.solvedProblems}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Solved Problems</div>
                          </div>
                          <div className="p-4 rounded-2xl bg-background/50 border border-border">
                            <div className="text-2xl font-black text-foreground">{userStats.stats.totalProblems}</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Assigned Tasks</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Upsolve Commitment</span>
                            <span className="text-3xl font-black text-accent">{userStats.stats.upsolvedSolvedCount} <span className="text-sm text-muted-foreground">/ {userStats.stats.upsolvedCount}</span></span>
                          </div>
                          <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${userStats.stats.upsolvedCount > 0 ? (userStats.stats.upsolvedSolvedCount / userStats.stats.upsolvedCount) * 100 : 0}%` }}
                              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                              className="h-full bg-accent rounded-full" 
                            />
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 leading-none">Difficulty Target</div>
                            <div className="text-xl font-black text-foreground tabular-nums">
                              {formatAvgProblemRating(userStats.stats.averageRating)}
                            </div>
                          </div>
                          <BarChart className="text-primary h-6 w-6 opacity-30" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Training Timeline */}
                <Card className="border-border bg-card/20 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                  <div className="px-8 py-6 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-tight uppercase flex items-center gap-2">
                      <TrendingUp className="text-primary h-4 w-4" />
                      Session History
                    </h3>
                  </div>
                  <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                    {userStats.trainings.length > 0 ? (
                      <div className="divide-y divide-border/50">
                        {userStats.trainings.map((training, i) => (
                          <motion.div 
                            key={training.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="p-5 hover:bg-muted/30 transition-colors group cursor-default"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                  <Calendar size={14} />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-foreground">
                                    {new Date(training.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                  <div className="text-[9px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock size={8} />
                                    {Math.round((training.endTime - training.startTime) / 60000)}m
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-black text-primary">{training.performance}</div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">SCORE</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 opacity-30">
                        <Calendar size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Footer with Actions */}
            <div className="shrink-0 p-6 border-t border-border bg-card/30 flex justify-between items-center px-10">
              <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} />
                Access Authorized Profile
              </div>
              <Button 
                onClick={() => setStatsDialog({ open: false, userId: null })}
                className="rounded-xl px-12 h-11 font-black uppercase tracking-widest text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                {closeButtonLabel}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="sr-only">Loading Stats</DialogTitle>
            <div className="h-[500px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                Synchronizing Database...
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

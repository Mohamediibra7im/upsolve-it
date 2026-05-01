'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Loader2,
  Zap,
  Star,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStats {
  user: {
    codeforcesHandle: string;
    rating: number;
    rank: string;
    maxRating: number;
    maxRank: string;
  };
  stats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    upsolvedCount: number;
    upsolvedSolvedCount: number;
    averagePerformance: number;
    bestPerformance: number;
    worstPerformance: number;
    solvingRate: number;
    averageRating: number;
    recentTrend: number;
    recentSessions: number;
  };
  trainings: Array<{
    id: string;
    startTime: number;
    endTime: number;
    performance: number;
    problemsCount: number;
    solvedCount: number;
  }>;
}

interface UserStatsDialogProps {
  statsDialog: { open: boolean; userId: string | null };
  setStatsDialog: (dialog: { open: boolean; userId: string | null }) => void;
  userStats: UserStats | null;
}

export function UserStatsDialog({ 
  statsDialog, 
  setStatsDialog, 
  userStats 
}: Readonly<UserStatsDialogProps>) {
  return (
    <Dialog open={statsDialog.open} onOpenChange={(open) => !open && setStatsDialog({ open: false, userId: null })}>
      <DialogContent className="z-[150] w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] border-white/10 bg-background/80 backdrop-blur-3xl p-0 shadow-3xl">
        {userStats ? (
          <div className="relative pb-24 md:pb-0">
            {/* Immersive Header */}
            <div className="relative h-64 overflow-hidden rounded-t-[3rem] bg-card/40 border-b border-white/5">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:30px_30px]" />
              </div>

              <DialogHeader className="relative h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-2xl shadow-primary/20">
                  <BarChart className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
                    Personnel Intelligence
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-1">
                    Deep analysis for <span className="text-primary">{userStats.user.codeforcesHandle}</span>
                  </DialogDescription>
                </div>
              </DialogHeader>
            </div>

            <div className="p-8 lg:p-12 space-y-12">
              {/* Primary Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Current Rating", value: userStats.user.rating || 0, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                  { label: "Max Rating", value: userStats.user.maxRating || 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Total Sessions", value: userStats.stats.totalSessions, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { label: "Recent Trend", value: `${userStats.stats.recentTrend >= 0 ? '+' : ''}${userStats.stats.recentTrend}`, icon: Zap, color: userStats.stats.recentTrend >= 0 ? "text-emerald-500" : "text-red-500", bg: userStats.stats.recentTrend >= 0 ? "bg-emerald-500/10" : "bg-red-500/10" }
                ].map((stat) => (
                  <Card key={stat.label} className="border-white/5 bg-card/20 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                      <stat.icon size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className={cn("p-2.5 rounded-xl border border-white/10 w-fit", stat.bg)}>
                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                      </div>
                      <div className="mt-4">
                        <div className="text-3xl font-black tracking-tighter text-foreground leading-none">{stat.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-2">{stat.label}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Secondary Detail Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tactical Performance */}
                <Card className="border-white/5 bg-card/10 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
                      <Target className="text-primary h-5 w-5" />
                      Tactical Execution
                    </h3>
                  </div>
                  <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Solving Rate</span>
                          <span className="text-2xl font-black text-primary">{userStats.stats.solvingRate}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${userStats.stats.solvingRate}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-xl font-black text-foreground">{userStats.stats.solvedProblems}</div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Solved</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-xl font-black text-foreground">{userStats.stats.totalProblems}</div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Total</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Upsolve Efficiency</span>
                          <span className="text-2xl font-black text-accent">{userStats.stats.upsolvedSolvedCount}/{userStats.stats.upsolvedCount}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${userStats.stats.upsolvedCount > 0 ? (userStats.stats.upsolvedSolvedCount / userStats.stats.upsolvedCount) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center justify-between">
                        <div>
                          <div className="text-lg font-black text-accent">Active Protocol</div>
                          <div className="text-[8px] font-black uppercase tracking-widest text-accent/60">Engagement Status</div>
                        </div>
                        <CheckCircle className="text-accent h-6 w-6 opacity-60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance History */}
                <Card className="border-white/5 bg-card/10 rounded-[2.5rem] overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-xl font-black tracking-tight uppercase flex items-center gap-3">
                      <TrendingUp className="text-primary h-5 w-5" />
                      Strategic History
                    </h3>
                  </div>
                  <CardContent className="p-8">
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {userStats.trainings.length > 0 ? userStats.trainings.map((training) => (
                        <div key={training.id} className="group relative p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Calendar size={18} />
                              </div>
                              <div>
                                <div className="text-sm font-black text-foreground leading-none">
                                  {new Date(training.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1 flex items-center gap-1.5">
                                  <Clock size={10} />
                                  {Math.round((training.endTime - training.startTime) / 60000)} MINS
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black text-primary leading-none">{training.performance}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">PERFORMANCE</div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-12 opacity-40">
                          <Calendar size={40} className="mx-auto mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Strategic Records Found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Dialog Footer */}
            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <Button 
                onClick={() => setStatsDialog({ open: false, userId: null })}
                className="rounded-xl px-10 h-12 font-black uppercase tracking-widest text-xs shadow-xl"
              >
                Close File
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Decrypting Intelligence Data...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';

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
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            User Statistics
          </DialogTitle>
          {userStats && (
            <DialogDescription className="text-base">
              Detailed statistics for <span className="font-semibold text-foreground">{userStats.user.codeforcesHandle}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        {userStats ? (
          <div className="space-y-6">
            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Rating</p>
                    <p className="text-2xl font-bold text-primary">{userStats.user.rating || 0}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userStats.user.rank || 'Unrated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Rating</p>
                    <p className="text-2xl font-bold text-primary">{userStats.user.maxRating || 0}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userStats.user.maxRank || 'Unrated'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold text-accent">{userStats.stats.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Sessions</p>
                    <p className="text-2xl font-bold text-accent">{userStats.stats.recentSessions}</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Training Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{userStats.stats.solvedProblems}</p>
                    <p className="text-xs text-muted-foreground mt-1">out of {userStats.stats.totalProblems}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-accent" />
                      <p className="text-sm font-medium text-muted-foreground">Upsolved</p>
                    </div>
                    <p className="text-3xl font-bold text-accent">{userStats.stats.upsolvedSolvedCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">out of {userStats.stats.upsolvedCount}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <p className="text-sm font-medium text-muted-foreground">Solving Rate</p>
                    </div>
                    <p className="text-3xl font-bold text-primary">{userStats.stats.solvingRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Average Performance</p>
                    <p className="text-2xl font-bold text-primary">{userStats.stats.averagePerformance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Best Performance</p>
                    <p className="text-2xl font-bold text-green-600">{userStats.stats.bestPerformance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Worst Performance</p>
                    <p className="text-2xl font-bold text-red-600">{userStats.stats.worstPerformance}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Recent Trend</p>
                    <p className={`text-2xl font-bold ${userStats.stats.recentTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {userStats.stats.recentTrend >= 0 ? '+' : ''}{userStats.stats.recentTrend}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Training Sessions */}
            {userStats.trainings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Training Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userStats.trainings.map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-sm font-medium">
                            {new Date(training.startTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {training.solvedCount} / {training.problemsCount} problems solved
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">Performance: {training.performance}</p>
                          <p className="text-xs text-muted-foreground">
                            Duration: {Math.round((training.endTime - training.startTime) / 60000)} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => setStatsDialog({ open: false, userId: null })}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

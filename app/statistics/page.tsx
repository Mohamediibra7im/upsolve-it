"use client";

import useHistory from "@/hooks/useHistory";
import useUser from "@/hooks/useUser";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import Loader from "@/app/_Components/Loader";
import History from "./_Components/History";
import ProgressChart from "./_Components/ProgressChart";
import UpsolveReminder from "@/app/_Components/UpsolveReminder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Trophy,
  Clock,
  CheckCircle2,
  LayoutDashboard,
  AlertTriangle,
  RefreshCw} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const formatMetric = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  return String(value);
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const StatCard = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subValue?: string; 
  icon: any; 
  color: string;
  trend?: number;
}) => (
  <motion.div variants={fadeUp}>
    <Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500", color)}>
        <Icon size={120} />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl border transition-colors duration-500", 
            "bg-background/40 border-border/40 group-hover:border-primary/30")}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? "default" : "destructive"} className="font-bold tabular-nums">
              {trend >= 0 ? "+" : ""}{trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70">{title}</p>
          <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
          {subValue && <p className="text-xs font-medium text-muted-foreground">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function StatisticsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { history, isLoading, deleteTraining, isDeleting, error, refresh } = useHistory();
  const { upsolvedProblems } = useUpsolvedProblems();
  const [tab, setTab] = useState<"overview" | "history">("overview");
  const [isRetrying, setIsRetrying] = useState(false);
  const hasError = !!error && history.length === 0;

  const stats = useMemo(() => {
    if (!history || history.length === 0) return null;

    const totalSessions = history.length;
    const totalProblems = history.reduce((acc, session) => acc + session.problems.length, 0);
    const solvedProblems = history.reduce((acc, session) =>
      acc + session.problems.filter(p => p.solvedTime).length, 0
    );
    const upsolvedCount = upsolvedProblems?.length || 0;

    const averagePerformance = Math.round(
      history.reduce((acc, session) => acc + session.performance, 0) / totalSessions
    );

    const bestPerformance = Math.max(...history.map(session => session.performance));

    const recentTrend = history.length >= 2 ?
      (history.at(-1)?.performance ?? 0) - (history.at(-2)?.performance ?? 0) : 0;

    const averageRatingRaw = history.reduce((acc, session) => {
      const sessionRatings = Object.values(session.customRatings ?? {}).filter(
        (r) => typeof r === "number" && Number.isFinite(r),
      );
      if (sessionRatings.length === 0) return acc;
      const sessionAvg =
        sessionRatings.reduce((sum, rating) => sum + rating, 0) /
        sessionRatings.length;
      return acc + sessionAvg;
    }, 0);
    const averageRating =
      averageRatingRaw > 0 ? Math.round(averageRatingRaw / totalSessions) : null;

    const solvingRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    return {
      totalSessions,
      totalProblems,
      solvedProblems,
      upsolvedCount,
      averagePerformance,
      bestPerformance,
      recentTrend,
      averageRating,
      solvingRate
    };
  }, [history, upsolvedProblems]);

  if (isLoading || isUserLoading) return <Loader />;
  if (!user) return <Loader />;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refresh();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen relative pb-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-background to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 max-w-7xl space-y-4">
        <UpsolveReminder />

        {/* Inline Error Banner */}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-5"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Unable to load training data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {error instanceof Error ? error.message : "Network error — the server may be offline. Your page will load with available data."}
                </p>
              </div>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="rounded-xl border-amber-500/30 hover:bg-amber-500/10 shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRetrying && "animate-spin")} />
                {isRetrying ? "Retrying…" : "Retry"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hero Dashboard Header */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
          <div className="relative bg-card/60 backdrop-blur-2xl border border-border/40 rounded-[2rem] p-6 lg:p-10 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 p-20 opacity-5">
              <LayoutDashboard size={400} />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Performance Hub</span>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.95]">
                    Analytics <span className="text-primary">&</span> Insights
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-medium">
                    Tracking your evolution as a competitive programmer. 
                    Analyzing <span className="text-foreground font-bold">{user.codeforcesHandle}</span>&apos;s journey.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button asChild size="lg" className="h-12 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                    <Link href="/training">New Training Session</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-2xl font-bold border-border/60 hover:bg-background/80 transition-all">
                    <Link href="/upsolve">View Upsolve Queue</Link>
                  </Button>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-2 gap-4 w-full lg:w-auto min-w-[320px]">
                  <div className="p-6 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md space-y-1 group/item hover:border-primary/30 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Solving Rate</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-foreground">{stats.solvingRate}</span>
                      <span className="text-sm font-black text-primary">%</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-background/40 border border-border/40 backdrop-blur-md space-y-1 group/item hover:border-primary/30 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Average Rating</p>
                    <div className="flex items-baseline gap-1 text-3xl font-black text-foreground">
                      {formatMetric(stats.averageRating)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-start mt-4">
              <div className="inline-flex p-1.5 rounded-2xl bg-background/40 border border-border/40 backdrop-blur-md">
                <button
                  onClick={() => setTab("overview")}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300",
                    tab === "overview" 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  Dashboard Overview
                </button>
                <button
                  onClick={() => setTab("history")}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300",
                    tab === "history" 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  Training Logs
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        {history && history.length > 0 && stats ? (
          <div>
            <AnimatePresence mode="wait">
              {tab === "overview" ? (
                <motion.div
                  key="overview"
                  variants={listStagger}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="space-y-4"
                >
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      title="Total Sessions"
                      value={formatMetric(stats.totalSessions)}
                      subValue="Sessions recorded"
                      icon={Calendar}
                      color="text-sky-500"
                    />
                    <StatCard 
                      title="Avg Performance"
                      value={formatMetric(stats.averagePerformance)}
                      subValue="Efficiency trend"
                      icon={TrendingUp}
                      color="text-emerald-500"
                      trend={stats.recentTrend}
                    />
                    <StatCard 
                      title="Peak Rating"
                      value={formatMetric(stats.bestPerformance)}
                      subValue="Personal record"
                      icon={Trophy}
                      color="text-amber-500"
                    />
                    <StatCard 
                      title="Solved Tasks"
                      value={formatMetric(stats.solvedProblems)}
                      subValue={`${stats.totalProblems} tasks attempted`}
                      icon={CheckCircle2}
                      color="text-rose-500"
                    />
                  </div>

                  {/* Secondary Insights Grid */}


                  {/* Trends Section */}
                  <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden w-full">
                    <CardContent className="p-0">
                      <div className="p-8 border-b border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground">Performance Trajectory</h3>
                            <p className="text-xs font-medium text-muted-foreground">Session-by-session evolution</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8">
                        <ProgressChart history={history} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-border/40 bg-card/30 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-8 border-b border-border/40 flex items-center justify-between bg-background/20">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground">Training Archive</h3>
                            <p className="text-xs font-medium text-muted-foreground">Detailed logs of every practice session</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 sm:p-8">
                        <History
                          history={history}
                          deleteTraining={(trainingId: string) =>
                            deleteTraining(trainingId)
                          }
                          isDeleting={isDeleting}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150 animate-pulse" />
              <div className="relative p-10 bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] shadow-2xl">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-3xl font-black text-foreground mb-2">Initialize Your Journey</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">
                  Complete your first training session to unlock personalized analytics and performance tracking.
                </p>
                <Button asChild size="lg" className="rounded-2xl px-10 font-black tracking-widest uppercase text-xs h-14 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                  <Link href="/training">Launch First Session</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}








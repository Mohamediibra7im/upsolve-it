"use client";

import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { History, ProgressChart, StatCard, ModeBreakdown } from "@/components/features/statistics";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Trophy,
  CheckCircle2,
  LayoutDashboard,
  AlertTriangle,
  RefreshCw,
  Clock,
  Cpu,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { m, Variants, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  isTrainingProblemCountedSolved,
  trainingSessionHasSolve,
} from "@/services/training/problemCountedSolved";
import { averageEffectiveProblemRatingForSession } from "@/services/training/effectiveProblemRating";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
  TRAINING_MODE_ORDER,
} from "@/services/training/trainingModeLabel";
import type { TrainingMode } from "@/types/TrainingMode";


export const formatMetric = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "-";
  if (Number.isNaN(value)) return "-";
  return String(value);
};

const countSolvedInSession = (session: any) =>
  session.problems.filter(isTrainingProblemCountedSolved).length;

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

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
    const solvedProblems = history.reduce(
      (acc, session) => acc + countSolvedInSession(session),
      0,
    );
    const upsolvedCount = upsolvedProblems?.length || 0;

    const sessionsWithSolve = history.filter(trainingSessionHasSolve);

    const averagePerformance =
      sessionsWithSolve.length > 0
        ? Math.round(
            sessionsWithSolve.reduce(
              (acc, session) => acc + (session.performance ?? 0),
              0,
            ) / sessionsWithSolve.length,
          )
        : null;

    const bestPerformance =
      sessionsWithSolve.length > 0
        ? Math.max(...sessionsWithSolve.map((s) => s.performance ?? 0))
        : null;

    const solvedChronological = [...sessionsWithSolve].sort(
      (a, b) => a.startTime - b.startTime,
    );
    const recentTrend =
      solvedChronological.length >= 2
        ? (solvedChronological.at(-1)?.performance ?? 0) -
          (solvedChronological.at(-2)?.performance ?? 0)
        : 0;

    const averageRatingRaw = history.reduce(
      (acc, session) =>
        acc + averageEffectiveProblemRatingForSession(session),
      0,
    );
    const averageRating =
      totalSessions > 0
        ? Math.round(averageRatingRaw / totalSessions)
        : null;

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

  const statsByMode = useMemo(() => {
    if (!history?.length) return [];
    const groups = new Map<TrainingMode, typeof history>();
    for (const session of history) {
      const mode = normalizeTrainingMode(session.trainingMode);
      const list = groups.get(mode) ?? [];
      list.push(session);
      groups.set(mode, list);
    }
    return TRAINING_MODE_ORDER.filter((m) => groups.has(m)).map((mode) => {
      const sessions = groups.get(mode)!;
      const totalProblems = sessions.reduce((acc, s) => acc + s.problems.length, 0);
      const solved = sessions.reduce((acc, s) => acc + countSolvedInSession(s), 0);

      const sessionsWithSolve = sessions.filter((s) => s.problems.some(isTrainingProblemCountedSolved));

      const avgPerf =
        sessionsWithSolve.length > 0
          ? Math.round(
              sessionsWithSolve.reduce(
                (acc, s) => acc + (s.performance ?? 0),
                0,
              ) / sessionsWithSolve.length,
            )
          : 0;
      const bestPerf =
        sessionsWithSolve.length > 0
          ? Math.max(...sessionsWithSolve.map((s) => s.performance ?? 0))
          : 0;
      const solvingRate =
        totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0;
      return {
        mode,
        label: formatTrainingModeLabel(mode),
        sessions: sessions.length,
        totalProblems,
        solved,
        averagePerformance: avgPerf,
        bestPerformance: bestPerf,
        solvingRate,
      };
    });
  }, [history]);

  if (isUserLoading) return <Loader />;
  if (!user) return <Loader />;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refresh();
    } finally {
      setIsRetrying(false);
    }
  };

  // Progress bar for solving rate
  const solvingBlocks = stats ? Math.min(20, Math.round((stats.solvingRate / 100) * 20)) : 0;
  const solvingBar = stats ? "█".repeat(solvingBlocks) + "░".repeat(20 - solvingBlocks) : "";

  return (
    <div className="min-h-screen relative pb-20 font-mono text-emerald-400">
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl space-y-6">
        <UpsolveReminder />

        {hasError && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 py-3 px-4 border-b border-amber-500/15"
          >
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">SYS.ERR // DATA_LOAD_FAILURE</p>
              <p className="text-[9px] text-amber-500/50 mt-0.5">
                {error instanceof Error ? error.message : "Network error. The server may be offline."}
              </p>
            </div>
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="h-8 rounded border border-amber-500/25 bg-transparent text-amber-400 font-bold uppercase tracking-widest text-[8px] hover:bg-amber-500/10 font-mono shrink-0"
            >
              <RefreshCw size={10} className={cn("mr-1.5", isRetrying && "animate-spin")} />
              {isRetrying ? "RETRYING..." : "[ RETRY.SH ]"}
            </Button>
          </m.div>
        )}

        {/* Terminal Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <LayoutDashboard size={12} className="text-emerald-400" />
            <span>ANALYTICS_ENGINE // PERFORMANCE_HUB</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>{user.codeforcesHandle}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Analytics & Insights Terminal
              </h1>
              <p className="text-[11px] text-emerald-500/40 max-w-2xl">
                Performance tracking and diagnostic metrics for <span className="text-emerald-300 font-bold">{user.codeforcesHandle}</span>.
              </p>

              {/* Inline summary stats */}
              {stats && (
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-emerald-500/40 pt-2">
                  <span>SOLVE_RATE: <span className="text-emerald-300 font-bold">{stats.solvingRate}%</span></span>
                  <span className="text-emerald-500/10">|</span>
                  <span>AVG_RATING: <span className="text-emerald-300 font-bold">{formatMetric(stats.averageRating)}</span></span>
                  <span className="text-emerald-500/10">|</span>
                  <span className="hidden sm:inline">[{solvingBar}]</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all font-mono">
                <Link href="/training">[ NEW_SESSION.EXE ]</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 transition-all font-mono">
                <Link href="/upsolve">[ UPSOLVE_QUEUE.SH ]</Link>
              </Button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setTab("overview")}
              className={cn(
                "h-9 px-4 rounded border font-bold uppercase tracking-widest text-[9px] transition-all font-mono",
                tab === "overview"
                  ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "bg-transparent border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
              )}
            >
              [ OVERVIEW.SH ]
            </button>
            <button
              onClick={() => setTab("history")}
              className={cn(
                "h-9 px-4 rounded border font-bold uppercase tracking-widest text-[9px] transition-all font-mono",
                tab === "history"
                  ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "bg-transparent border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
              )}
            >
              [ TRAINING_LOGS.SH ]
            </button>
          </div>
        </m.div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 border-b border-emerald-500/10" />
              ))}
            </div>
            <div className="h-64 w-full border-b border-emerald-500/10" />
          </div>
        ) : history && history.length > 0 && stats ? (
          <div>
            <AnimatePresence mode="wait">
              {tab === "overview" ? (
                <m.div
                  key="overview"
                  variants={listStagger}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
                    <StatCard
                      title="Total Sessions"
                      value={formatMetric(stats.totalSessions)}
                      subValue="Sessions recorded"
                      icon={Calendar}
                    />
                    <StatCard
                      title="Avg Performance"
                      value={formatMetric(stats.averagePerformance)}
                      subValue="Sessions with ≥1 solve"
                      icon={TrendingUp}
                      trend={stats.recentTrend}
                    />
                    <StatCard
                      title="Peak Rating"
                      value={formatMetric(stats.bestPerformance)}
                      subValue="Sessions with ≥1 solve"
                      icon={Trophy}
                    />
                    <StatCard
                      title="Solved Tasks"
                      value={formatMetric(stats.solvedProblems)}
                      subValue={`${stats.totalProblems} tasks attempted`}
                      icon={CheckCircle2}
                    />
                  </div>

                  <ModeBreakdown statsByMode={statsByMode} />

                  {/* Performance Chart Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span>PERFORMANCE_TRAJECTORY // SESSION_EVOLUTION</span>
                      <span className="flex-1 border-b border-emerald-500/10" />
                    </div>
                    <div className="py-4">
                      <ProgressChart history={history} />
                    </div>
                  </div>
                </m.div>
              ) : (
                <m.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
                    <Clock size={12} className="text-emerald-400" />
                    <span>TRAINING_ARCHIVE // SESSION_LOGS</span>
                    <span className="flex-1 border-b border-emerald-500/10" />
                  </div>
                  <History
                    history={history}
                    deleteTraining={(trainingId: string) =>
                      deleteTraining(trainingId)
                    }
                    isDeleting={isDeleting}
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-16 text-center space-y-6">
            <div className="size-14 rounded border border-emerald-500/15 bg-emerald-950/10 flex items-center justify-center mx-auto text-emerald-500/30">
              <BarChart3 size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Initialize Analytics Engine</h3>
              <p className="text-[11px] text-emerald-500/40 max-w-sm mx-auto">
                Complete your first training session to unlock performance tracking and diagnostic analytics.
              </p>
            </div>
            <Button asChild className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all font-mono">
              <Link href="/training">[ LAUNCH_FIRST_SESSION.EXE ]</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

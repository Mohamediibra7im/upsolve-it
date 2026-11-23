"use client";

import MemberPageState from "@/components/features/profile/MemberPageState";

import StudioMascot from "@/components/shared/StudioMascot";
import StudioProgress from "@/components/features/profile/StudioProgress";


import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { History, ProgressChart, StatCard, ModeBreakdown } from "@/components/features/statistics";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Calendar,
  Trophy,
  CheckCircle2,
  LayoutDashboard,
  Clock,
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

  return (
    <div className="min-h-screen relative pb-20 font-sans text-foreground">

      <section className="mx-auto w-full py-8 lg:py-12 max-w-7xl space-y-6">
        <UpsolveReminder />

        <m.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <LayoutDashboard size={12} className="text-primary" />
            <span>Your practice, in perspective</span>
            <span className="flex-1 border-b border-border" />
            <span>{user.codeforcesHandle}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                See your progress clearly.
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                A clear view of your practice, <span className="text-foreground font-medium">{user.codeforcesHandle}</span>.
              </p>

              {/* Inline summary stats */}
              {stats && (
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Solve rate: <span className="text-foreground font-medium">{stats.solvingRate}%</span></span>
                  <span className="text-muted-foreground">|</span>
                  <span>Average rating: <span className="text-foreground font-medium">{formatMetric(stats.averageRating)}</span></span>
                  <span className="text-muted-foreground">|</span>
                  <StudioProgress value={stats.solvingRate} label="Solve rate" className="hidden sm:block max-w-24" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Button asChild className="h-10 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans">
                <Link href="/training">New session</Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-lg border border-border bg-transparent text-primary font-medium text-xs hover:bg-primary/10 transition-all font-sans">
                <Link href="/upsolve">Upsolve list</Link>
              </Button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setTab("overview")}
              aria-pressed={tab === "overview"}
              className={cn(
                "h-10 px-4 rounded-xl border font-medium text-sm transition-all font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                tab === "overview"
                  ? "bg-primary text-primary-foreground border-border"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setTab("history")}
              aria-pressed={tab === "history"}
              className={cn(
                "h-10 px-4 rounded-xl border font-medium text-sm transition-all font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                tab === "history"
                  ? "bg-primary text-primary-foreground border-border"
                  : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              Session history
            </button>
          </div>
        </m.div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 border-b border-border" />
              ))}
            </div>
            <div className="h-64 w-full border-b border-border" />
          </div>
        ) : history && history.length > 0 && stats ? (
          <div>
            <AnimatePresence mode="wait">
              {tab === "overview" ? (
                <m.div
                  key="overview"
                  variants={listStagger}
                  initial={false}
                  animate="show"
                  exit="hidden"
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      title="Total sessions"
                      value={formatMetric(stats.totalSessions)}
                      subValue="Sessions recorded"
                      icon={Calendar}
                    />
                    <StatCard
                      title="Avg. performance"
                      value={formatMetric(stats.averagePerformance)}
                      subValue="Sessions with ≥1 solve"
                      icon={TrendingUp}
                      trend={stats.recentTrend}
                    />
                    <StatCard
                      title="Best performance"
                      value={formatMetric(stats.bestPerformance)}
                      subValue="Sessions with ≥1 solve"
                      icon={Trophy}
                    />
                    <StatCard
                      title="Solved problems"
                      value={formatMetric(stats.solvedProblems)}
                      subValue={`${stats.totalProblems} tasks attempted`}
                      icon={CheckCircle2}
                    />
                  </div>

                  <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <section className="min-w-0 space-y-4">
                      <div>
                        <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">Performance over time</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Every session adds to the picture.</p>
                      </div>
                      <ProgressChart history={history} />
                    </section>
                    <aside className="rounded-2xl border border-border bg-card p-6">
                      <p className="text-sm font-medium text-muted-foreground">Your practice snapshot</p>
                      <p className="mt-6 font-heading text-5xl font-medium tracking-tight tabular-nums text-foreground">{stats.solvingRate}<span className="text-2xl text-muted-foreground">%</span></p>
                      <p className="mt-2 text-sm text-muted-foreground">of attempted problems solved</p>
                      <StudioProgress value={stats.solvingRate} label="Overall solving rate" className="mt-5" />
                      <dl className="mt-6 space-y-4 border-t border-border pt-5 text-sm">
                        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Average rating</dt><dd className="tabular-nums text-foreground">{formatMetric(stats.averageRating)}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Recent trend</dt><dd className={cn("tabular-nums", stats.recentTrend >= 0 ? "text-primary" : "text-red-300")}>{stats.recentTrend > 0 ? "+" : ""}{stats.recentTrend}</dd></div>
                      </dl>
                    </aside>
                  </div>
                  <ModeBreakdown statsByMode={statsByMode} />
                </m.div>
              ) : (
                <m.div
                  key="history"
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Clock size={12} className="text-primary" />
                    <span>Session history</span>
                    <span className="flex-1 border-b border-border" />
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
        ) : hasError ? (
          <MemberPageState kind="error" title="Your history is unavailable" description="We couldn’t load your sessions. Try again to bring your progress into view."><Button variant="outline" disabled={isRetrying} onClick={handleRetry}>{isRetrying ? "Trying again…" : "Try again"}</Button></MemberPageState>
        ) : (
          <div className="py-16 text-center space-y-6">
            <StudioMascot pose="think" className="mx-auto w-36" />
            <div className="space-y-2">
              <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">Your progress starts here.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Complete your first session to see your performance, solve rate, and progress over time.
              </p>
            </div>
            <Button asChild className="h-10 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans">
              <Link href="/training">Start your first session</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

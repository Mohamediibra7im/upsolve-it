"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCw } from "lucide-react";
import {
  History,
  ModeBreakdown,
  ProgressChart,
} from "@/components/features/statistics";
import Loader from "@/components/shared/Loader";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState, PageHead, Stat } from "@/components/ui/kit";
import { useUser } from "@/hooks/auth";
import { useHistory } from "@/hooks/data";
import { averageEffectiveProblemRatingForSession } from "@/services/training/effectiveProblemRating";
import {
  isTrainingProblemCountedSolved,
  trainingSessionHasSolve,
} from "@/services/training/problemCountedSolved";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
  TRAINING_MODE_ORDER,
} from "@/services/training/trainingModeLabel";
import type { Training } from "@/types/Training";
import type { TrainingMode } from "@/types/TrainingMode";

const fmt = (value: number | null) =>
  value === null || Number.isNaN(value) ? "—" : value;

const countSolvedInSession = (session: Training) =>
  session.problems.filter(isTrainingProblemCountedSolved).length;

export default function StatisticsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { history, isLoading, deleteTraining, isDeleting, error, refresh } =
    useHistory();
  const [isRetrying, setIsRetrying] = useState(false);

  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const totalSessions = history.length;
    const totalProblems = history.reduce(
      (acc, session) => acc + session.problems.length,
      0,
    );
    const solvedProblems = history.reduce(
      (acc, session) => acc + countSolvedInSession(session),
      0,
    );

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
        : null;

    const averageRating = Math.round(
      history.reduce(
        (acc, session) =>
          acc + averageEffectiveProblemRatingForSession(session),
        0,
      ) / totalSessions,
    );

    return {
      totalSessions,
      totalProblems,
      solvedProblems,
      averagePerformance,
      bestPerformance,
      recentTrend,
      averageRating,
      solvingRate:
        totalProblems > 0
          ? Math.round((solvedProblems / totalProblems) * 100)
          : 0,
    };
  }, [history]);

  const statsByMode = useMemo(() => {
    const groups = new Map<TrainingMode, Training[]>();
    for (const session of history) {
      const mode = normalizeTrainingMode(session.trainingMode);
      groups.set(mode, [...(groups.get(mode) ?? []), session]);
    }
    return TRAINING_MODE_ORDER.filter((m) => groups.has(m)).map((mode) => {
      const sessions = groups.get(mode)!;
      const totalProblems = sessions.reduce(
        (acc, s) => acc + s.problems.length,
        0,
      );
      const solved = sessions.reduce(
        (acc, s) => acc + countSolvedInSession(s),
        0,
      );
      const withSolve = sessions.filter(trainingSessionHasSolve);
      const performances = withSolve.map((s) => s.performance ?? 0);

      return {
        mode,
        label: formatTrainingModeLabel(mode),
        sessions: sessions.length,
        totalProblems,
        solved,
        averagePerformance:
          withSolve.length > 0
            ? Math.round(
                performances.reduce((a, b) => a + b, 0) / withSolve.length,
              )
            : 0,
        bestPerformance: withSolve.length > 0 ? Math.max(...performances) : 0,
        solvingRate:
          totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0,
      };
    });
  }, [history]);

  if (isUserLoading || !user) return <Loader fullScreen={false} />;

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refresh();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <>
      <PageHead eyebrow="Statistics" title="See the practice paying off.">
        {stats && (
          <>
            <Link href="/upsolve" className="u-btn u-btn--sm">
              Open your upsolve queue
            </Link>
            <Link href="/training" className="u-btn">
              Start a training session <ArrowUpRight />
            </Link>
          </>
        )}
      </PageHead>

      <div className="grid gap-6">
        <UpsolveReminder />

        {isLoading ? (
          <Loader fullScreen={false} message="Loading your sessions…" />
        ) : stats ? (
          <>
            <section className="u-panel u-strip" aria-label="Headline numbers">
              <Stat
                label="Sessions"
                value={stats.totalSessions}
                sub="Sessions recorded"
              />
              <Stat
                label="Average performance"
                value={fmt(stats.averagePerformance)}
                sub={
                  stats.recentTrend === null ? (
                    "Sessions with at least one solve"
                  ) : (
                    <>
                      Latest session{" "}
                      <span className="t-num">
                        {stats.recentTrend > 0 && "+"}
                        {stats.recentTrend}
                      </span>{" "}
                      on the one before
                    </>
                  )
                }
              />
              <Stat
                label="Best performance"
                value={fmt(stats.bestPerformance)}
                sub="Sessions with at least one solve"
              />
              <Stat
                label="Problems solved"
                value={stats.solvedProblems}
                sub={`of ${stats.totalProblems} attempted`}
              />
              <Stat
                label="Solve rate"
                value={stats.solvingRate}
                unit="%"
                sub={
                  <Bar
                    value={stats.solvingRate}
                    label="Overall solve rate"
                    className="mt-1"
                  />
                }
              />
              <Stat
                label="Average problem rating"
                value={fmt(stats.averageRating)}
                sub="Across every set"
              />
            </section>

            <div className="grid min-w-0 gap-6 lg:grid-cols-12">
              <section className="u-panel lg:col-span-7">
                <div className="u-panel__head">
                  <h2 className="t-h2">Performance over time</h2>
                  <span className="t-sm t-muted">
                    Every session adds to the picture.
                  </span>
                </div>
                <div className="u-panel__body">
                  <ProgressChart history={history} />
                </div>
              </section>

              <section className="u-panel lg:col-span-5">
                <div className="u-panel__head">
                  <h2 className="t-h2">By mode</h2>
                  <span className="t-sm t-muted">
                    Performance in sessions with a solve
                  </span>
                </div>
                <ModeBreakdown statsByMode={statsByMode} />
              </section>
            </div>

            <section className="u-panel">
              <div className="u-panel__head">
                <h2 className="t-h2">Session history</h2>
                <span className="t-sm t-muted">
                  <span className="t-num">{stats.totalSessions}</span>{" "}
                  {stats.totalSessions === 1 ? "session" : "sessions"}
                </span>
              </div>
              <History
                history={history}
                deleteTraining={deleteTraining}
                isDeleting={isDeleting}
              />
            </section>
          </>
        ) : error ? (
          <div role="alert">
            <EmptyState
              title="Your history did not load."
              action={
                <Button
                  variant="outline"
                  disabled={isRetrying}
                  onClick={handleRetry}
                >
                  <RotateCw />
                  {isRetrying ? "Trying again…" : "Try again"}
                </Button>
              }
            >
              We could not reach your sessions. Try again in a minute.
            </EmptyState>
          </div>
        ) : (
          <EmptyState
            title="Your progress starts here."
            action={
              <Link href="/training" className="u-btn u-btn--primary">
                Start a training session <ArrowUpRight />
              </Link>
            }
          >
            Finish your first session to see your performance, your solve rate
            and how both move over time.
          </EmptyState>
        )}
      </div>
    </>
  );
}

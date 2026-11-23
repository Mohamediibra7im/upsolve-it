"use client";

import Link from "next/link";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { History } from "@/components/features/statistics";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState, PageHead, Stat } from "@/components/ui/kit";
import { useUser } from "@/hooks/auth";
import { useHistory } from "@/hooks/data";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";

export default function TrainingReviewsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { history, isLoading: historyLoading, error, refresh } = useHistory();

  if (userLoading || historyLoading || !user)
    return <Loader fullScreen={false} message="Loading your sessions…" />;

  const sessions = history
    .filter((t) => t._id)
    .sort((a, b) => b.endTime - a.endTime);

  const solvedIn = sessions.map(
    (t) => t.problems.filter(isTrainingProblemCountedSolved).length,
  );
  const totalSolved = solvedIn.reduce((a, b) => a + b, 0);
  const totalProblems = sessions.reduce((a, t) => a + t.problems.length, 0);
  const toUpsolve = sessions.filter(
    (t, i) => solvedIn[i] < t.problems.length,
  ).length;
  const solveRate =
    totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  return (
    <>
      <PageHead eyebrow="Reviews" title="Look back before you move on.">
        {sessions.length > 0 && (
          <Link href="/training" className="u-btn">
            Start a training session <ArrowUpRight />
          </Link>
        )}
      </PageHead>

      {error ? (
        <div role="alert">
          <EmptyState
            title="Your sessions did not load."
            action={
              <Button variant="outline" onClick={() => void refresh()}>
                <RotateCw />
                Try again
              </Button>
            }
          >
            We could not reach your saved sessions. Try again in a minute.
          </EmptyState>
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          title="Your session history starts here."
          action={
            <Link href="/training" className="u-btn u-btn--primary">
              Start a training session <ArrowUpRight />
            </Link>
          }
        >
          Finish a training session and its review lands here: every problem,
          how long it took, and what to do about it.
        </EmptyState>
      ) : (
        <div className="grid gap-6">
          <section className="u-panel u-strip" aria-label="Sessions in numbers">
            <Stat
              label="Sessions"
              value={sessions.length}
              sub="Ready to review"
            />
            <Stat
              label="Need upsolving"
              value={toUpsolve}
              sub="Sessions with a problem left"
            />
            <Stat
              label="Problems solved"
              value={totalSolved}
              sub={`of ${totalProblems} in your sets`}
            />
            <Stat
              label="Solve rate"
              value={solveRate}
              unit="%"
              sub={
                <Bar
                  value={solveRate}
                  label="Solve rate across sessions"
                  className="mt-1"
                />
              }
            />
          </section>

          <section className="u-panel">
            <div className="u-panel__head">
              <h2 className="t-h2">Past sessions</h2>
              <span className="t-sm t-muted">Newest first</span>
            </div>
            <History history={sessions} />
          </section>
        </div>
      )}
    </>
  );
}

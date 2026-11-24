"use client";

import { useMemo } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/kit";
import ActivityHeatmap from "@/components/shared/ActivityHeatmap";
import { useProfileData } from "@/components/features/profile/useProfileData";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";

const formatDate = (time: number | string) =>
  new Date(time).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function ProfileActivityPage() {
  const { user, history, upsolvedProblems } = useProfileData();
  const recentSessions = useMemo(
    () => [...history].sort((a, b) => b.startTime - a.startTime).slice(0, 5),
    [history],
  );
  if (!user) return null;

  return (
    <>
      <ActivityHeatmap
        history={history}
        upsolvedProblems={upsolvedProblems}
        stats
      />
      {recentSessions.length ? (
        <section className="u-panel">
          <div className="u-panel__head">
            <h2 className="t-h2">Recent sessions</h2>
            <Link href="/statistics" className="u-btn u-btn--sm">
              All sessions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="u-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Date</th>
                  <th className="num">Solved</th>
                  <th className="num">Performance</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s._id ?? s.startTime}>
                    <td>
                      <b className="capitalize">
                        {s.trainingMode ?? "Training"}
                      </b>
                    </td>
                    <td>{formatDate(s.startTime)}</td>
                    <td className="num">
                      {s.problems.filter(isTrainingProblemCountedSolved).length}
                      /{s.problems.length}
                    </td>
                    <td className="num">{s.performance ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No sessions yet."
          action={
            <Link href="/training" className="u-btn u-btn--primary">
              Start a training session
            </Link>
          }
        >
          Your five most recent sessions show up here once you train.
        </EmptyState>
      )}
    </>
  );
}

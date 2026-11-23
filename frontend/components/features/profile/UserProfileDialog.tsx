"use client";

import { useRef } from "react";
import useSWR from "swr";
import UserAvatar from "@/components/shared/UserAvatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rank, Stat } from "@/components/ui/kit";
import { apiFetcher } from "@/lib/apiClient";
import { formatAvgProblemRating } from "@/services/training/formatAvgProblemRating";
import type { UserTrainingStatsView } from "@/types/userTrainingStats";
import type { UpsolveProblem } from "@/types/UpsolveProblem";
import { rankKey } from "@/utils/rank";
import { Achievements, isEarned, trainingAchievements } from "./Achievements";
import MemberPageState from "./MemberPageState";

interface UserProfileDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** API prefix that serves `/:userId/stats`. Friends by default; admin screens pass the admin prefix. */
  statsBase?: string;
}

const percent = (part: number, whole: number) =>
  whole ? Math.round((part / whole) * 100) : 0;

export function UserProfileDialog({
  userId,
  open,
  onOpenChange,
  statsBase = "/api/friends",
}: Readonly<UserProfileDialogProps>) {
  const openerRef = useRef<HTMLElement | null>(null);
  const { data, error, isLoading, mutate } = useSWR<UserTrainingStatsView>(
    open && userId ? `${statsBase}/${userId}/stats` : null,
    apiFetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  // Only friends share their queue: the admin view has no such list.
  const { data: shared } = useSWR<{ problems: UpsolveProblem[] }>(
    open && userId && statsBase === "/api/friends"
      ? `/api/friends/${userId}/shared-upsolves`
      : null,
    apiFetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 },
  );

  const user = data?.user;
  const stats = data?.stats;
  const achievements = stats
    ? trainingAchievements({
        sessions: stats.totalSessions,
        solveRate: stats.solvingRate,
        upsolved: stats.upsolvedSolvedCount,
        avgPerformance: stats.averagePerformance,
      })
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-w-3xl flex-col gap-0 overflow-hidden p-0"
        onOpenAutoFocus={() => {
          openerRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current?.focus();
        }}
      >
        <header className="flex shrink-0 items-center gap-4 border-b border-line py-4 pl-5 pr-14">
          <UserAvatar {...user} size={48} />
          <div className="min-w-0">
            <DialogTitle className="t-h2 break-all">
              {user?.codeforcesHandle ?? "Profile"}
            </DialogTitle>
            <DialogDescription className="t-sm t-muted">
              Sessions, solve rate and recent practice on Upsolve It.
            </DialogDescription>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading && !data ? (
            <MemberPageState
              kind="loading"
              title="Loading this profile"
              className="m-5"
            />
          ) : error ? (
            <MemberPageState
              kind="error"
              title="This profile did not load."
              description="The server did not answer. Try again in a moment."
              className="m-5"
            >
              <Button variant="outline" onClick={() => mutate()}>
                Try again
              </Button>
            </MemberPageState>
          ) : user && stats ? (
            <>
              <div className="t-sm flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4">
                <Rank rating={user.rating} showRating />
                <span className="t-muted">
                  Best <span className="t-num">{user.maxRating}</span>
                </span>
                <a
                  className="u-btn u-btn--sm sm:ml-auto"
                  href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open on Codeforces
                </a>
              </div>

              <div className="u-strip grid-cols-2 border-b border-line sm:grid-cols-3">
                <Stat label="Sessions" value={stats.totalSessions} />
                <Stat
                  label="Solved"
                  value={stats.solvedProblems}
                  unit={`/ ${stats.totalProblems}`}
                  sub={`${stats.solvingRate}% solve rate`}
                />
                <Stat
                  label="Upsolved"
                  value={stats.upsolvedSolvedCount}
                  unit={`/ ${stats.upsolvedCount}`}
                  sub={`${percent(stats.upsolvedSolvedCount, stats.upsolvedCount)}% of the queue cleared`}
                />
                <Stat
                  label="Avg. performance"
                  value={stats.averagePerformance}
                />
                <Stat label="Best performance" value={stats.bestPerformance} />
                <Stat
                  label="Avg. problem rating"
                  value={formatAvgProblemRating(stats.averageRating)}
                />
              </div>

              {shared && (
                <section
                  className="border-b border-line"
                  aria-labelledby="shared-title"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pb-2 pt-5">
                    <h3 id="shared-title" className="t-h3">
                      You are both stuck on
                    </h3>
                    <span className="t-sm t-muted t-num">
                      {shared.problems.length} in common
                    </span>
                  </div>
                  {shared.problems.length ? (
                    // problems of one contest sit together
                    [...shared.problems]
                      .sort((a, b) =>
                        `${a.judge}:${a.contestId}${a.index}`.localeCompare(
                          `${b.judge}:${b.contestId}${b.index}`,
                          "en",
                          { numeric: true },
                        ),
                      )
                      .map((problem) => (
                        <div
                          key={`${problem.judge}:${problem.contestId}:${problem.index}`}
                          className="u-prow"
                          data-state="failed"
                        >
                          <span className="u-prow__slot">{problem.index}</span>
                          <div className="min-w-0">
                            <a
                              className="u-prow__name block"
                              href={problem.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {problem.name}
                            </a>
                            <p className="u-prow__meta truncate">
                              {problem.judge === "atcoder"
                                ? `AtCoder ${String(problem.contestId).toUpperCase()}`
                                : `Contest ${problem.contestId}`}{" "}
                              · waiting in both queues
                            </p>
                          </div>
                          {problem.rating ? (
                            <span
                              className="u-rank t-num"
                              data-rank={rankKey(problem.rating)}
                            >
                              {problem.rating}
                            </span>
                          ) : (
                            <span className="u-prow__rating">—</span>
                          )}
                        </div>
                      ))
                  ) : (
                    <p className="t-sm t-muted px-5 pb-5">
                      Nothing in common right now. When you both miss the same
                      problem, it shows here so you can upsolve it together.
                    </p>
                  )}
                </section>
              )}

              <section className="grid gap-4 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="t-h3">Achievements</h3>
                  <span className="t-sm t-muted t-num">
                    {achievements.filter(isEarned).length} of{" "}
                    {achievements.length} earned
                  </span>
                </div>
                <Achievements items={achievements} />
              </section>

              <section className="border-t border-line">
                <h3 className="t-h3 px-5 pt-5">Recent sessions</h3>
                {data.trainings.length ? (
                  <div className="overflow-x-auto">
                    <table className="u-table mt-2">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th className="num">Solved</th>
                          <th className="num">Time</th>
                          <th className="num">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.trainings.map((t) => (
                          <tr key={t.id}>
                            <td>
                              {new Date(t.startTime).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="num">
                              {t.solvedCount}/{t.problemsCount}
                            </td>
                            <td className="num">
                              {Math.round((t.endTime - t.startTime) / 60000)}m
                            </td>
                            <td className="num">{t.performance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="t-muted px-5 pb-5 pt-2">No sessions yet.</p>
                )}
              </section>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { UpsolveRow, sessionProblemKeys } from "@/components/features/upsolve";
import ActivityHeatmap from "@/components/shared/ActivityHeatmap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState, PageHead, Rank, Stat } from "@/components/ui/kit";
import { useUser } from "@/hooks/auth";
import { useHeatmapData, useHistory, useUpsolvedProblems } from "@/hooks/data";
import { useFriendRequests } from "@/hooks/social";
import { swrFetcher } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { isResolveDue } from "@/types/UpsolveProblem";
import { rankName } from "@/utils/rank";
import { dailyGoal } from "./dailyGoal";

type Streaks = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

const DAY_MS = 86_400_000;
const OWED_SHOWN = 3;

const count = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

/** Days since 1970 in UTC, from a time in seconds or milliseconds. */
const utcDay = (time: number) =>
  Math.floor((time < 1e10 ? time * 1000 : time) / DAY_MS);

/** "Today": what to do next first, then the numbers. */
export default function Dashboard() {
  const { user } = useUser();
  const { incoming } = useFriendRequests(!!user);
  const {
    history,
    isLoading: isHistoryLoading,
    error: historyError,
    refresh: refreshHistory,
  } = useHistory();
  const {
    upsolvedProblems,
    isLoading: isUpsolveLoading,
    error: upsolveError,
    refreshUpsolvedProblems,
  } = useUpsolvedProblems();
  const { totalSolved } = useHeatmapData(history, upsolvedProblems);
  const { data: streaks } = useSWR<Streaks>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  if (!user) return null;

  const pending = upsolvedProblems.filter((p) => !p.solvedTime);
  const total = upsolvedProblems.length;
  const solved = total - pending.length;
  const cleared = total > 0 ? Math.round((solved / total) * 100) : 0;
  const sessionKeys = sessionProblemKeys(history);
  const resolving = upsolvedProblems.filter((p) => isResolveDue(p)).length;
  const goal = dailyGoal(upsolvedProblems.map((p) => p.solvedTime));
  const rating = user.rating || 0;

  // The same days the API's seven-day consistency counts: a finished session
  // or a solved upsolve, by UTC day.
  const activeDays = new Set(
    [
      ...history.map((t) => t.endTime),
      ...upsolvedProblems.map((p) => p.solvedTime),
    ]
      .filter((t): t is number => typeof t === "number" && t > 0)
      .map(utcDay),
  );
  const today = utcDay(Date.now());
  const week = Array.from({ length: 7 }, (_, i) => today - 6 + i);

  const streakLines = [
    ["Training streak", streaks && count(streaks.trainingStreak, "day")],
    ["Upsolve streak", streaks && count(streaks.upsolveStreak, "day")],
    ["Longest streak", streaks && count(streaks.bestStreak, "day")],
    ["Consistency, last 7 days", streaks && `${streaks.consistencyScore}%`],
  ];

  return (
    <>
      <PageHead
        eyebrow="A new day. A little more progress."
        title={
          <>
            Welcome back,{" "}
            <span className="break-words">{user.codeforcesHandle}</span>.
          </>
        }
      >
        {incoming.length > 0 && (
          <Link href="/friends" className="u-btn u-btn--sm">
            {count(incoming.length, "friend request")} waiting
          </Link>
        )}
        <Link href="/training" className="u-btn u-btn--primary u-btn--lg">
          Start a training session <ArrowUpRight aria-hidden="true" />
        </Link>
      </PageHead>

      {(historyError || upsolveError) && (
        <div role="alert" className="mb-6 flex flex-wrap items-center gap-3">
          <p>
            Some of your progress did not load. Check your connection and try
            again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              Promise.all([refreshHistory(), refreshUpsolvedProblems()])
            }
          >
            Try again
          </Button>
        </div>
      )}

      {isHistoryLoading || isUpsolveLoading ? (
        <div
          role="status"
          aria-label="Loading your progress"
          className="grid animate-pulse gap-6 motion-reduce:animate-none lg:grid-cols-12"
        >
          <div className="u-panel h-72 lg:col-span-7" />
          <div className="u-panel h-72 lg:col-span-5" />
          <div className="u-panel h-32 lg:col-span-12" />
          <div className="u-panel h-64 lg:col-span-4" />
          <div className="u-panel h-64 lg:col-span-8" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <section
            className="u-panel flex flex-col lg:col-span-7"
            aria-labelledby="owed-title"
          >
            <div className="u-panel__head">
              <h2 id="owed-title" className="t-h2">
                Still owed
              </h2>
              <span className="flex flex-wrap items-center gap-2">
                {resolving > 0 && (
                  <Badge variant="line">
                    <span className="t-num">{resolving}</span> to re-solve
                  </Badge>
                )}
                {pending.length > 0 && (
                  <Badge variant="pending">
                    <RotateCcw aria-hidden="true" />
                    <span className="t-num">{pending.length}</span> waiting
                  </Badge>
                )}
              </span>
            </div>
            {pending.length > 0 ? (
              <div>
                {pending.slice(0, OWED_SHOWN).map((problem, i) => (
                  <UpsolveRow
                    key={`${problem.contestId}${problem.index}`}
                    problem={problem}
                    slot={i + 1}
                    sessionKeys={sessionKeys}
                  />
                ))}
              </div>
            ) : (
              <EmptyState className="border-0" title="You’re all caught up.">
                Problems you miss in sessions and contests land here on their
                own. Nothing is waiting right now.
              </EmptyState>
            )}
            <div className="u-panel__foot mt-auto">
              {total > 0 && (
                <span className="flex flex-wrap items-center gap-3">
                  <span>
                    <span className="t-num">{cleared}%</span> cleared ·{" "}
                    <span className="t-num">
                      {solved} of {total}
                    </span>
                  </span>
                  <Bar
                    value={cleared}
                    label="Share of your upsolve queue solved"
                    className="w-40"
                  />
                </span>
              )}
              <Link href="/upsolve" className="u-btn u-btn--sm">
                Open your upsolve list
              </Link>
            </div>
          </section>

          {goal.done || pending.length > 0 ? (
            <section
              className="u-panel u-inverse grid content-between gap-5 p-7 max-sm:p-5 lg:col-span-5"
              aria-labelledby="goal-title"
            >
              <div className="grid gap-2.5">
                <h2 id="goal-title" className="t-h2">
                  Today’s goal
                </h2>
                <p className="t-eyebrow">One upsolve a day</p>
                <p className="t-num-xl">
                  {goal.done ? 1 : 0} / 1
                  <span className="sr-only">
                    {goal.done ? ", done for today" : ", not done yet"}
                  </span>
                </p>
                <p className="t-muted">
                  {goal.done
                    ? `Done for today. ${count(goal.streak, "day")} in a row.`
                    : goal.streak > 0
                      ? `${count(goal.streak, "day")} in a row so far. Solve one problem from your queue to make it ${goal.streak + 1}.`
                      : "Solve one problem from your queue today to start a streak."}
                </p>
              </div>
              <Link
                href="/upsolve"
                className="u-btn u-btn--primary justify-self-start"
              >
                {goal.done ? "Open your queue" : "Pick today’s problem"}{" "}
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </section>
          ) : (
            <section
              className="u-panel u-inverse grid content-between gap-5 p-7 lg:col-span-5"
              aria-labelledby="next-title"
            >
              <div className="grid gap-2.5">
                <h2 id="next-title" className="t-h2">
                  Your next challenge
                </h2>
                <p className="t-eyebrow">Recommended problem rating</p>
                <p className="t-num-xl">
                  {rating + 100}–{rating + 300}
                </p>
                <p className="t-muted">
                  A little outside your comfort zone: 100 to 300 points above
                  your rating.
                </p>
              </div>
              <Link
                href="/training"
                className="u-btn u-btn--primary justify-self-start"
              >
                Find a challenge <ArrowUpRight aria-hidden="true" />
              </Link>
            </section>
          )}

          <div className="u-panel u-strip lg:col-span-12">
            <Stat
              label="Codeforces rating"
              value={rating}
              sub={<Rank rating={user.rating} />}
            />
            <Stat
              label="Personal best"
              value={user.maxRating || 0}
              sub={rankName(user.maxRating)}
            />
            <Stat
              label="Problems solved"
              value={totalSolved.toLocaleString()}
              sub={`${solved.toLocaleString()} upsolved`}
            />
            <Stat
              label="Training sessions"
              value={history.length.toLocaleString()}
              sub={`${count(pending.length, "problem")} to upsolve`}
            />
          </div>

          <section
            className="u-panel lg:col-span-4"
            aria-labelledby="streaks-title"
          >
            <div className="u-panel__head">
              <h2 id="streaks-title" className="t-h2">
                Streaks
              </h2>
              <ol className="flex gap-1.5" aria-label="Your last seven days">
                {week.map((day) => {
                  const date = new Date(day * DAY_MS);
                  const active = activeDays.has(day);
                  return (
                    <li
                      key={day}
                      title={`${date.toLocaleDateString(undefined, { dateStyle: "medium", timeZone: "UTC" })}: ${active ? "practised" : "no practice"}`}
                      className={cn(
                        "grid size-8 place-items-center rounded-sm font-mono text-[11px] font-semibold",
                        active
                          ? "bg-solved text-ground"
                          : "bg-surface-sunk text-ink-muted",
                      )}
                    >
                      <span aria-hidden="true">
                        {"SMTWTFS"[date.getUTCDay()]}
                      </span>
                      <span className="sr-only">
                        {date.toLocaleDateString(undefined, {
                          weekday: "long",
                          timeZone: "UTC",
                        })}
                        : {active ? "practised" : "no practice"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
            {streakLines.map(([label, value]) => (
              <div key={label} className="u-kv">
                <span>{label}</span>
                <b>{value ?? "—"}</b>
              </div>
            ))}
          </section>

          <ActivityHeatmap
            history={history}
            upsolvedProblems={upsolvedProblems}
            className="lg:col-span-8"
          />
        </div>
      )}
    </>
  );
}

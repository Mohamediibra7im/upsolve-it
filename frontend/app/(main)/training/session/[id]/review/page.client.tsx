"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Check, Plus, RotateCw, X } from "lucide-react";
import Loader from "@/components/shared/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState, PageHead, Stat } from "@/components/ui/kit";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { apiClient } from "@/lib/apiClient";
import type { SpeedStatus } from "@/services/training/speedStatus";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import type { TrainingProblem } from "@/types/TrainingProblem";

type ReviewProblem = {
  problemId: string;
  name: string;
  contestId: number;
  index: string;
  rating: number;
  tags: string[];
  solved: boolean;
  attempts: number;
  timeSpentSeconds: number;
  expectedTimeSeconds: number;
  speedStatus: SpeedStatus;
  insightMessage: string;
  recommendation: string;
};

type ReviewPayload = {
  sessionId: string;
  summary: {
    totalProblems: number;
    totalTimeSpent: number;
    averageTimePerProblem: number;
    performanceScore: number;
    trainingMode?: string;
    durationMinutes?: number;
  };
  problems: ReviewProblem[];
};

const PACE: Partial<Record<SpeedStatus, string>> = {
  fast: "Ahead of the expected pace",
  normal: "On the expected pace",
  slow: "An opportunity to build speed",
};

const reading = (p: ReviewProblem) =>
  p.solved ? PACE[p.speedStatus] : "A good problem to revisit";

const minutes = (seconds: number) => Math.round(seconds / 60);

const problemUrl = (p: ReviewProblem) =>
  `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`;

export default function SessionReviewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { addUpsolvedProblems, upsolvedProblems } = useUpsolvedProblems();
  const { history } = useHistory();

  const [data, setData] = useState<ReviewPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<ReviewPayload>(
          `/api/training-sessions/${id}/review`,
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "We could not reach this review.",
          );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const isInUpsolveQueue = (p: ReviewProblem) =>
    upsolvedProblems.some(
      (u) => u.contestId === p.contestId && u.index === p.index,
    );

  const addOneUpsolve = (p: ReviewProblem) =>
    addUpsolvedProblems([
      {
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        tags: p.tags,
        url: problemUrl(p),
        solvedTime: null,
      } as TrainingProblem,
    ]);

  const endTime = history.find((t) => t._id === id)?.endTime;
  const head = (
    <PageHead
      eyebrow={[
        "Session review",
        data &&
          formatTrainingModeLabel(
            normalizeTrainingMode(data.summary.trainingMode),
          ),
        endTime &&
          new Date(endTime).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
      ]
        .filter(Boolean)
        .join(" · ")}
      title="A closer look at your progress."
    >
      <Link href="/training/reviews" className="u-btn u-btn--sm">
        Back to reviews
      </Link>
    </PageHead>
  );

  if (error)
    return (
      <>
        {head}
        <div role="alert">
          <EmptyState
            title="This review did not load."
            action={
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setError(null);
                    setRetryCount((count) => count + 1);
                  }}
                >
                  <RotateCw />
                  Try again
                </Button>
                <Link href="/training" className="u-btn u-btn--ghost">
                  Back to training
                </Link>
              </div>
            }
          >
            {error}
          </EmptyState>
        </div>
      </>
    );

  if (!data)
    return (
      <>
        {head}
        <Loader fullScreen={false} message="Loading the review…" />
      </>
    );

  const { summary, problems } = data;
  const solved = problems.filter((p) => p.solved).length;
  const total = summary.totalProblems ?? problems.length;
  const solveRate = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <>
      {head}

      <div className="grid gap-6">
        <section className="u-panel u-strip" aria-label="Session in numbers">
          <Stat
            label="Problems solved"
            value={`${solved}/${total}`}
            sub={
              solved < total
                ? `${total - solved} left to upsolve`
                : "Nothing left to upsolve"
            }
          />
          <Stat label="Performance" value={summary.performanceScore} />
          <Stat
            label="Time spent"
            value={minutes(summary.totalTimeSpent)}
            unit="m"
            sub={
              summary.durationMinutes
                ? `Of a ${summary.durationMinutes} minute session`
                : undefined
            }
          />
          <Stat
            label="Average per solve"
            value={solved > 0 ? minutes(summary.averageTimePerProblem) : "—"}
            unit={solved > 0 ? "m" : undefined}
          />
          <Stat
            label="Solve rate"
            value={solveRate}
            unit="%"
            sub={
              <Bar
                value={solveRate}
                label="Solve rate in this session"
                className="mt-1"
              />
            }
          />
        </section>

        <div className="grid min-w-0 gap-6 lg:grid-cols-12">
          <div className="grid min-w-0 content-start gap-6 lg:col-span-8">
            {problems.length === 0 ? (
              <EmptyState title="No problem details for this session.">
                You can still open another session or start a new one.
              </EmptyState>
            ) : (
              <>
                <section className="u-panel">
                  <div className="u-panel__head">
                    <h2 className="t-h2">Problem breakdown</h2>
                    <span className="t-sm t-muted">
                      Each name opens the problem on Codeforces
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="u-table">
                      <thead>
                        <tr>
                          <th>Problem</th>
                          <th className="num">Rating</th>
                          <th>Result</th>
                          <th className="num">Attempts</th>
                          <th className="num">Time / expected</th>
                          <th>
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {problems.map((p) => (
                          <tr key={p.problemId}>
                            <td className="min-w-56">
                              <a
                                href={problemUrl(p)}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold underline-offset-4 hover:underline"
                              >
                                {p.index} · {p.name}
                              </a>
                              <br />
                              <span className="t-sm t-muted">{reading(p)}</span>
                            </td>
                            <td className="num">{p.rating}</td>
                            <td>
                              {p.solved ? (
                                <Badge variant="solved">
                                  <Check />
                                  Accepted
                                </Badge>
                              ) : (
                                <Badge variant="failed">
                                  <X />
                                  Unsolved
                                </Badge>
                              )}
                            </td>
                            <td className="num">{p.attempts}</td>
                            <td className="num whitespace-nowrap">
                              {minutes(p.timeSpentSeconds)}m /{" "}
                              {minutes(p.expectedTimeSeconds)}m
                            </td>
                            <td className="text-right">
                              {!p.solved &&
                                (isInUpsolveQueue(p) ? (
                                  <Badge variant="line">
                                    <Check />
                                    In your queue
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    aria-label={`Add to upsolve: ${p.index} · ${p.name}`}
                                    onClick={() => void addOneUpsolve(p)}
                                  >
                                    <Plus />
                                    Add to upsolve
                                  </Button>
                                ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="u-panel">
                  <div className="u-panel__head">
                    <h2 className="t-h2">Notes on each problem</h2>
                  </div>
                  {problems.map((p) => (
                    <div key={p.problemId} className="u-prow items-start">
                      <span className="u-prow__slot">{p.index}</span>
                      <div className="min-w-0">
                        <h3 className="t-h3">{p.name}</h3>
                        <p className="u-prow__meta">
                          <span className="t-num">#{p.contestId}</span>
                          {p.tags
                            .slice(0, 4)
                            .map((tag) => ` · ${tag}`)
                            .join("")}
                        </p>
                        {p.insightMessage && (
                          <p className="mt-2 max-w-prose">{p.insightMessage}</p>
                        )}
                        {p.recommendation && (
                          <p className="t-muted max-w-prose">
                            {p.recommendation}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              </>
            )}
          </div>

          <aside className="u-panel self-start lg:col-span-4">
            <div className="u-panel__head">
              <h2 className="t-h2">Keep your momentum</h2>
            </div>
            <div className="u-panel__body grid gap-3">
              <p className="t-muted">
                Take another look at the problems you missed, or start a fresh
                session while the ideas are still with you.
              </p>
              <Link href="/training" className="u-btn u-btn--primary">
                Start a training session <ArrowUpRight />
              </Link>
              <Link href="/upsolve" className="u-btn">
                Open your upsolve queue
              </Link>
              <Link href="/dashboard" className="u-btn u-btn--ghost">
                Back to dashboard
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

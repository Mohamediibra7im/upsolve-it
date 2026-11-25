"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Check, Plus, RotateCw, X } from "lucide-react";
import Loader from "@/components/shared/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHead } from "@/components/ui/kit";
import { useUser } from "@/hooks/auth";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { apiClient } from "@/lib/apiClient";
import { sessionLine } from "@/services/training/sessionLine";
import type { SpeedStatus } from "@/services/training/speedStatus";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";
import type { Judge, TrainingProblem } from "@/types/TrainingProblem";
import "./review.css";

type ReviewProblem = {
  problemId: string;
  name: string;
  judge?: Judge;
  contestId: number | string;
  index: string;
  /** Sent since AtCoder joined; older reviews are Codeforces and rebuild it. */
  url?: string;
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
  p.url || `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`;

export default function SessionReviewPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { addUpsolvedProblems, upsolvedProblems } = useUpsolvedProblems();
  const { history } = useHistory();
  const { user } = useUser();

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
        judge: p.judge,
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
  const eyebrow = [
    "Session review",
    data &&
      formatTrainingModeLabel(normalizeTrainingMode(data.summary.trainingMode)),
    endTime &&
      new Date(endTime).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  ]
    .filter(Boolean)
    .join(" · ");
  const head = (
    <PageHead eyebrow={eyebrow} title="A closer look at your progress.">
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
  const solved = problems.filter((p) => p.solved);
  const total = summary.totalProblems ?? problems.length;
  const gap = user?.rating ? summary.performanceScore - user.rating : null;
  const expected = solved.length
    ? solved.reduce((sum, p) => sum + p.expectedTimeSeconds, 0) / solved.length
    : 0;
  const notes = problems.filter((p) => p.insightMessage || p.recommendation);

  return (
    <div className="grid gap-7">
      <section className="rv" aria-labelledby="review-title">
        <div className="rv__beam" aria-hidden="true" />
        <div className="rv__top">
          <h1 id="review-title" className="t-eyebrow">
            {eyebrow}
          </h1>
          <Link href="/training/reviews" className="u-btn u-btn--sm">
            All reviews
          </Link>
        </div>

        <p
          className="rv__score"
          aria-label={`${solved.length} of ${total} solved`}
        >
          {solved.length}
          <span aria-hidden="true">/{total}</span>
        </p>
        <p className="rv__say">{sessionLine(problems)}</p>

        <div className="rv__nums">
          <div>
            <span className="t-eyebrow">Performance</span>
            <b>{summary.performanceScore}</b>
            {gap !== null && (
              <small>
                {gap === 0
                  ? `Level with your rating of ${user!.rating}`
                  : `${Math.abs(gap)} ${gap < 0 ? "under" : "over"} your rating of ${user!.rating}`}
              </small>
            )}
          </div>
          <div>
            <span className="t-eyebrow">Time used</span>
            <b>{minutes(summary.totalTimeSpent)}m</b>
            {Boolean(summary.durationMinutes) && (
              <small>of a {summary.durationMinutes} minute session</small>
            )}
          </div>
          <div>
            <span className="t-eyebrow">Average per solve</span>
            <b>
              {solved.length > 0
                ? `${minutes(summary.averageTimePerProblem)}m`
                : "—"}
            </b>
            {solved.length > 0 && (
              <small>expected about {minutes(expected)}m</small>
            )}
          </div>
        </div>

        {problems.length === 0 ? (
          <div className="mt-7 w-full text-left">
            <EmptyState title="No problem details for this session.">
              You can still open another session or start a new one.
            </EmptyState>
          </div>
        ) : (
          <ul className="rv__set" aria-label="The problems in this session">
            {problems.map((p) => (
              <li
                key={p.problemId}
                className="rv__tile"
                data-unsolved={!p.solved || undefined}
              >
                <header>
                  <span className="u-prow__slot">{p.index}</span>
                  <span className="t-num">
                    {p.judge === "atcoder" ? (
                      <span
                        className="u-est"
                        title="Estimated from its AtCoder difficulty, on the Codeforces scale"
                      >
                        {p.rating}
                        <span className="sr-only">, estimated</span>
                      </span>
                    ) : (
                      p.rating
                    )}
                  </span>
                </header>
                <h3>
                  <a href={problemUrl(p)} target="_blank" rel="noreferrer">
                    {p.name}
                  </a>
                </h3>
                <p>{reading(p)}</p>
                <footer>
                  <span
                    className="rv__verdict"
                    data-unsolved={!p.solved || undefined}
                  >
                    {p.solved ? (
                      <Check aria-hidden="true" />
                    ) : (
                      <X aria-hidden="true" />
                    )}
                    {p.solved ? "Accepted" : "Unsolved"}
                  </span>
                  {p.solved ? (
                    <span className="t-num t-sm t-muted">
                      {minutes(p.timeSpentSeconds)}m of{" "}
                      {minutes(p.expectedTimeSeconds)}m
                    </span>
                  ) : isInUpsolveQueue(p) ? (
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
                  )}
                </footer>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="rv__low">
        {notes.length > 0 && (
          <section aria-labelledby="review-notes">
            <h2 id="review-notes">What to take from it</h2>
            <div className="mt-2">
              {notes.map((p) => (
                <div key={p.problemId} className="rv__note">
                  <span className="u-prow__slot">{p.index}</span>
                  <div className="min-w-0">
                    <h3>{p.name}</h3>
                    <p className="u-prow__meta">
                      <span className="t-num">#{p.contestId}</span>
                      {p.tags
                        .slice(0, 4)
                        .map((tag) => ` · ${tag}`)
                        .join("")}
                    </p>
                    {p.insightMessage && <p>{p.insightMessage}</p>}
                    {p.recommendation && (
                      <p className="t-muted">{p.recommendation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <aside className="rv__next" aria-labelledby="review-next">
          <h2 id="review-next">Next</h2>
          <p className="t-muted">
            {solved.length < total
              ? "Look again at the ones you missed, or start a fresh session while the ideas are still with you."
              : "A clean sheet. Start a fresh session while the ideas are still with you."}
          </p>
          <Link href="/training" className="u-btn u-btn--primary">
            Start another session <ArrowUpRight />
          </Link>
          <Link href="/upsolve" className="u-btn">
            Open your upsolve queue
          </Link>
          <Link href="/dashboard" className="u-btn u-btn--ghost">
            Back to dashboard
          </Link>
        </aside>
      </div>
    </div>
  );
}

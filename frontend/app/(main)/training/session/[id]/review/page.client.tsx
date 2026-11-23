"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Target,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BookOpen,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useUpsolvedProblems } from "@/hooks/data";
import type { TrainingProblem } from "@/types/TrainingProblem";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

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
  speedStatus: string;
  insightMessage: string;
  recommendation: string;
};

type ReviewPayload = {
  sessionId: string;
  summary: {
    totalProblems: number;
    solvedProblems: number;
    unsolvedProblems: number;
    totalTimeSpent: number;
    averageTimePerProblem: number;
    performanceScore: number;
    trainingMode?: string;
    durationMinutes?: number;
  };
  problems: ReviewProblem[];
};

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function SessionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const { addUpsolvedProblems, upsolvedProblems } = useUpsolvedProblems();

  const isInUpsolveQueue = (p: ReviewProblem) =>
    upsolvedProblems.some(
      (u) => u.contestId === p.contestId && u.index === p.index,
    );

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
          setError(e instanceof Error ? e.message : "Failed to load review");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const addOneUpsolve = async (p: ReviewProblem) => {
    const tp = {
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating,
      tags: p.tags,
      url: `https://codeforces.com/contest/${p.contestId}/problem/${p.index}`,
      solvedTime: null,
    } as TrainingProblem;
    await addUpsolvedProblems([tp]);
  };

  if (error) {
    return (
      <div className="min-h-[60dvh] flex items-center justify-center px-4 py-10 font-sans text-[#f1f3ee]">
        <div
          role="alert"
          className="w-full max-w-lg rounded-2xl border border-[#2b3031] bg-[#191c1e] p-6 text-center space-y-5 sm:p-10"
        >
          <h1 className="font-heading text-2xl font-medium">
            This review couldn’t load.
          </h1>
          <p className="text-sm text-[#e5a39d]">{error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => {
                setError(null);
                setRetryCount((count) => count + 1);
              }}
              className="rounded-xl"
            >
              <RefreshCw className="size-4" />
              Try again
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 font-sans"
            >
              <Link href="/training/reviews">All sessions</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 font-sans"
            >
              <Link href="/training">Back to training</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <Loader message="Loading review..." />;

  const { summary, problems } = data;
  const solvedFromRows = problems.filter((p) => p.solved).length;
  const totalProblems = summary.totalProblems ?? problems.length;
  const solvedDisplay = solvedFromRows;
  const solveRate =
    totalProblems > 0 ? Math.round((solvedDisplay / totalProblems) * 100) : 0;

  const modeLabel =
    summary.trainingMode === "contest"
      ? "Contest simulation"
      : summary.trainingMode === "speed"
        ? "Speed round"
        : summary.trainingMode === "endurance"
          ? "Endurance"
          : summary.trainingMode === "weakness"
            ? "Weakness training"
            : "Ladder training";

  return (
    <section className="min-h-screen relative overflow-hidden font-sans text-[#f1f3ee]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Link
            href="/training/reviews"
            className="inline-flex items-center gap-2 text-sm text-[#929b98] hover:text-[#b5e3c4]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All sessions
          </Link>
          {/* Back + Header */}
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium tracking-normal text-[#929b98]">
                <TrendingUp size={12} className="text-[#b5e3c4]" />
                <span>Session review</span>
                <span className="flex-1 border-b border-[#2b3031]" />
                <span className="text-[#929b98]">{modeLabel}</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
                A closer look at your progress.
              </h1>
            </div>
          </m.div>

          {/* Session summary */}
          <m.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <div className="p-4 sm:p-5 rounded-2xl border border-[#2b3031] bg-[#191c1e]">
              <span className="text-xs font-medium tracking-normal text-[#929b98]">
                Problems solved
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-medium text-[#b5e3c4] tabular-nums">
                  {solvedDisplay}/{totalProblems}
                </span>
                <Target size={12} className="text-[#929b98]" />
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-[#2b3031] bg-[#191c1e]">
              <span className="text-xs font-medium tracking-normal text-[#929b98]">
                Performance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-medium text-[#b5e3c4] tabular-nums">
                  {summary.performanceScore}
                </span>
                <TrendingUp size={12} className="text-[#929b98]" />
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-[#2b3031] bg-[#191c1e]">
              <span className="text-xs font-medium tracking-normal text-[#929b98]">
                Time spent
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-medium text-[#b5e3c4] tabular-nums">
                  {Math.round(summary.totalTimeSpent / 60)}m
                </span>
                <Clock size={12} className="text-[#929b98]" />
              </div>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl border border-[#2b3031] bg-[#191c1e]">
              <span className="text-xs font-medium tracking-normal text-[#929b98]">
                Solve rate
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl font-medium text-[#b5e3c4] tabular-nums">
                  {solveRate}%
                </span>
                <span
                  className="h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-[#2b3031]"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-[#b5e3c4]"
                    style={{ width: `${solveRate}%` }}
                  />
                </span>
              </div>
            </div>
          </m.div>

          {/* Problem Breakdown Header */}
          <div className="flex items-center gap-2 text-xs font-medium tracking-normal text-[#929b98] pt-4">
            <Target size={12} className="text-[#b5e3c4]" />
            <span>Problem breakdown</span>
            <span className="flex-1 border-b border-[#2b3031]" />
          </div>

          {/* Problem List */}
          <m.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-3"
          >
            {problems.length === 0 && (
              <div className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-8 text-center">
                <h2 className="font-heading text-xl font-medium">
                  No problem details are available.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#929b98]">
                  You can still explore another session or return to training
                  below.
                </p>
              </div>
            )}
            {problems.map((p) => (
              <m.div
                key={p.problemId}
                variants={fadeUp}
                className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-5 sm:p-6"
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:gap-8">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          p.solved ? "text-[#b5e3c4]" : "text-[#929b98]",
                        )}
                      >
                        {p.index}
                      </span>
                      <span className="w-full font-heading text-xl font-medium leading-snug text-[#f1f3ee]">
                        {p.name}
                      </span>
                      <span className="text-xs text-[#929b98] tabular-nums">
                        #{p.contestId}
                      </span>
                      <span className="text-xs text-[#929b98] tabular-nums">
                        Rating {p.rating}
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-[#2b3031] px-2 py-1 text-xs text-[#929b98]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <dl className="my-5 grid grid-cols-2 gap-4 border-y border-[#2b3031] py-4 sm:grid-cols-3">
                      <div>
                        <dt className="mb-1 text-xs text-[#929b98]">Result</dt>
                        <dd
                          className={cn(
                            "text-sm font-medium",
                            p.solved ? "text-[#b5e3c4]" : "text-[#d5b98a]",
                          )}
                        >
                          {p.solved ? "Accepted" : "Unsolved"}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs text-[#929b98]">
                          Attempts
                        </dt>
                        <dd className="text-sm tabular-nums text-[#f1f3ee]">
                          {p.attempts}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs text-[#929b98]">
                          Time / expected
                        </dt>
                        <dd className="text-sm tabular-nums text-[#f1f3ee]">
                          {Math.round(p.timeSpentSeconds / 60)}m /{" "}
                          {Math.round(p.expectedTimeSeconds / 60)}m
                        </dd>
                      </div>
                    </dl>
                    {p.speedStatus && (
                      <p
                        className={cn(
                          "mb-3 text-xs font-medium",
                          p.speedStatus === "fast"
                            ? "text-[#b5e3c4]"
                            : p.speedStatus === "slow"
                              ? "text-[#d5b98a]"
                              : "text-[#929b98]",
                        )}
                      >
                        {p.speedStatus === "fast"
                          ? "Ahead of the expected pace"
                          : p.speedStatus === "slow"
                            ? "An opportunity to build speed"
                            : p.speedStatus === "unsolved"
                              ? "A good problem to revisit"
                              : p.speedStatus}
                      </p>
                    )}

                    {/* Insight + Recommendation */}
                    {p.insightMessage && (
                      <p className="text-sm text-[#929b98] mt-2 leading-relaxed">
                        {p.insightMessage}
                      </p>
                    )}
                    {p.recommendation && (
                      <p className="text-sm text-[#929b98] mt-1">
                        {p.recommendation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                    <a
                      href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-3 rounded-xl border border-[#2b3031] bg-transparent text-[#929b98] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 hover:text-[#b5e3c4] transition-all inline-flex items-center gap-1.5"
                    >
                      Open problem
                      <ArrowRight size={9} />
                    </a>
                    {!p.solved &&
                      (isInUpsolveQueue(p) ? (
                        <span className="h-10 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] text-xs font-medium tracking-normal inline-flex items-center gap-1.5">
                          <CheckCircle2 size={9} />
                          In your queue
                        </span>
                      ) : (
                        <button
                          onClick={() => void addOneUpsolve(p)}
                          className="h-10 px-3 rounded-xl border border-[#d5b98a]/20 bg-transparent text-[#d5b98a] font-medium tracking-normal text-xs hover:bg-[#d5b98a]/5 hover:text-[#d5b98a] transition-all inline-flex items-center gap-1.5"
                        >
                          Add to upsolve
                        </button>
                      ))}
                  </div>
                </div>
              </m.div>
            ))}
          </m.div>

          {/* What's Next */}
          <m.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="pt-6 border-t border-[#2b3031] space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-medium tracking-normal text-[#929b98]">
              <BookOpen size={12} className="text-[#b5e3c4]" />
              <span>Keep your momentum</span>
            </div>

            <p className="text-sm text-[#929b98] leading-relaxed">
              Take another look at the problems you missed, or start a fresh
              session while the ideas are still with you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="h-10 rounded-xl bg-[#b5e3c4] text-[#101214] font-medium tracking-normal text-xs  hover:bg-[#ceedd8] transition-all font-sans"
              >
                <Link href="/training">
                  <Trophy size={12} className="mr-2" />
                  Start another session
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 transition-all font-sans"
              >
                <Link href="/upsolve">Your upsolve queue</Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl border border-[#2b3031] bg-transparent text-[#929b98] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 hover:text-[#b5e3c4] transition-all font-sans"
                onClick={() => router.push("/dashboard")}
              >
                Back to dashboard
              </Button>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

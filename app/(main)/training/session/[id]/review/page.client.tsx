"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import {
  ChevronLeft,
  Trophy,
  Clock,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  BookOpen,
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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
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
  }, [id]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/training/reviews">All Reviews</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/training">Training</Link>
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
  const solveRate = totalProblems > 0 ? Math.round((solvedDisplay / totalProblems) * 100) : 0;

  const modeLabel =
    summary.trainingMode === "contest"
      ? "Contest Simulation"
      : summary.trainingMode === "speed"
        ? "Speed Round"
        : summary.trainingMode === "endurance"
          ? "Endurance Mode"
          : summary.trainingMode === "weakness"
            ? "Weakness Training"
            : "Ladder Training";

  return (
    <section className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/[0.02] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.012]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/training/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="size-3.5" />
              All Reviews
            </Link>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Session Review
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Performance Recap
              </h1>
              <p className="text-sm text-muted-foreground">
                {modeLabel} session completed
              </p>
            </div>
          </m.div>

          <m.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)]"
          >
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.04]">
              <h2 className="text-lg font-bold text-foreground">Session Summary</h2>
            </div>
            <div className="p-6 sm:px-8 sm:pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Target className="size-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {solvedDisplay}/{totalProblems}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-1">
                    Solved
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="size-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {summary.performanceScore}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-1">
                    Performance
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <Clock className="size-4 text-sky-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {Math.round(summary.totalTimeSpent / 60)}m
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-1">
                    Total Time
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Zap className="size-4 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {solveRate}%
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mt-1">
                    Solve Rate
                  </p>
                </div>
              </div>
            </div>
          </m.div>

          <m.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-4"
          >
            <h2 className="text-lg font-bold text-foreground">Problem Breakdown</h2>
            <div className="grid gap-3">
              {problems.map((p) => (
                <m.div
                  key={p.problemId}
                  variants={fadeUp}
                  className={cn(
                    "rounded-2xl border transition-all duration-300 overflow-hidden",
                    p.solved
                      ? "border-emerald-500/10 bg-emerald-500/[0.02]"
                      : "border-white/[0.04] bg-white/[0.02]",
                  )}
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={cn(
                              "flex size-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm",
                              p.solved
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-white/[0.04] text-muted-foreground",
                            )}
                          >
                            {p.index}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground truncate">
                              {p.name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground/60">
                              #{p.contestId} · Rating {p.rating}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[9px] font-medium text-muted-foreground/60 bg-white/[0.03] border border-white/[0.04] uppercase tracking-wider"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-muted-foreground bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                        >
                          Open on CF
                          <ArrowRight className="size-3" />
                        </a>
                        {!p.solved &&
                          (isInUpsolveQueue(p) ? (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 className="size-3" />
                              In Queue
                            </span>
                          ) : (
                            <button
                              onClick={() => void addOneUpsolve(p)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                              + Upsolve
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/[0.04] space-y-3">
                      <div className="flex items-center gap-4 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {p.solved ? (
                            <CheckCircle2 className="size-3 text-emerald-400" />
                          ) : (
                            <XCircle className="size-3 text-rose-400" />
                          )}
                          <span className={p.solved ? "text-emerald-400" : "text-rose-400"}>
                            {p.solved ? "Accepted" : "Unsolved"}
                          </span>
                        </div>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-muted-foreground/60">{p.attempts} attempt{p.attempts !== 1 ? "s" : ""}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-muted-foreground/60">
                          {Math.round(p.timeSpentSeconds / 60)}m / {Math.round(p.expectedTimeSeconds / 60)}m expected
                        </span>
                        {p.speedStatus && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className={cn(
                              "font-medium",
                              p.speedStatus === "fast" ? "text-emerald-400" :
                              p.speedStatus === "slow" ? "text-amber-400" :
                              "text-muted-foreground/60"
                            )}>
                              {p.speedStatus}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-[12px] text-foreground/80 leading-relaxed">
                        {p.insightMessage}
                      </p>
                      <p className="text-[11px] text-muted-foreground/50">
                        {p.recommendation}
                      </p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          <m.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)]"
          >
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">What&apos;s Next</h2>
                  <p className="text-xs text-muted-foreground">Keep the momentum going</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Lock in one upsolve block for misses, then schedule the next session while patterns are fresh.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  className="h-11 px-6 text-[11px] font-bold uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/training">
                    <Trophy className="size-3.5 mr-2" />
                    Start Next Session
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-6 text-[11px] font-bold uppercase tracking-wider rounded-xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                >
                  <Link href="/upsolve">Upsolve Queue</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 px-6 text-[11px] font-bold uppercase tracking-wider rounded-xl text-muted-foreground hover:text-foreground"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

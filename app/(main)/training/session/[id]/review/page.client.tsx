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
      <div className="min-h-screen flex items-center justify-center font-mono text-emerald-400">
        <div className="text-center space-y-4">
          <p className="text-[11px] text-red-400">[SYS.ERR] {error}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="outline" className="h-9 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 font-mono">
              <Link href="/training/reviews">[ ALL_REVIEWS.SH ]</Link>
            </Button>
            <Button asChild variant="outline" className="h-9 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 font-mono">
              <Link href="/training">[ TRAINING.SH ]</Link>
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

  const modeExe =
    summary.trainingMode === "contest"
      ? "CONTEST_SIM.BAT"
      : summary.trainingMode === "speed"
        ? "SPEED_BURST.COM"
        : summary.trainingMode === "endurance"
          ? "ENDURANCE_TEST.BAT"
          : summary.trainingMode === "weakness"
            ? "WEAKNESS_CORRECT.SYS"
            : "LADDER_TRAINING.EXE";

  // Progress bar
  const totalBlocks = 20;
  const filledBlocks = Math.min(totalBlocks, Math.round((solveRate / 100) * totalBlocks));
  const progressBar = "█".repeat(filledBlocks) + "░".repeat(totalBlocks - filledBlocks);

  return (
    <section className="min-h-screen relative overflow-hidden font-mono text-emerald-400">
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back + Header */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
                <TrendingUp size={12} className="text-emerald-400" />
                <span>SESSION_REVIEW // PERFORMANCE_AUDIT</span>
                <span className="flex-1 border-b border-emerald-500/10" />
                <span className="text-emerald-500/25">{modeExe}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Performance Audit
              </h1>
            </div>
          </m.div>

          {/* Summary Telemetry */}
          <m.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="py-3 px-4 border-b border-emerald-500/10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">SOLVED.COUNT</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-300 tabular-nums">{solvedDisplay}/{totalProblems}</span>
                <Target size={12} className="text-emerald-500/40" />
              </div>
            </div>
            <div className="py-3 px-4 border-b border-emerald-500/10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">PERFORMANCE.SCORE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-300 tabular-nums">{summary.performanceScore}</span>
                <TrendingUp size={12} className="text-emerald-500/40" />
              </div>
            </div>
            <div className="py-3 px-4 border-b border-emerald-500/10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">TOTAL.TIME</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-300 tabular-nums">{Math.round(summary.totalTimeSpent / 60)}m</span>
                <Clock size={12} className="text-emerald-500/40" />
              </div>
            </div>
            <div className="py-3 px-4 border-b border-emerald-500/10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">SOLVE.RATE</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xl font-bold text-emerald-300 tabular-nums">{solveRate}%</span>
                <span className="text-[9px] text-emerald-500/25 hidden sm:inline">[{progressBar}]</span>
              </div>
            </div>
          </m.div>

          {/* Problem Breakdown Header */}
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40 pt-4">
            <Target size={12} className="text-emerald-400" />
            <span>PROBLEM_BREAKDOWN // DIAGNOSTIC_OUTPUT</span>
            <span className="flex-1 border-b border-emerald-500/10" />
          </div>

          {/* Problem List */}
          <m.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="divide-y divide-emerald-500/[0.07]"
          >
            {problems.map((p) => (
              <m.div
                key={p.problemId}
                variants={fadeUp}
                className="py-4 px-2 hover:bg-emerald-950/5 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "text-xs font-bold",
                        p.solved ? "text-emerald-300" : "text-emerald-500/60"
                      )}>
                        [{p.index}]
                      </span>
                      <span className="text-xs font-bold text-emerald-300 truncate">{p.name}</span>
                      <span className="text-[9px] text-emerald-500/30 tabular-nums">#{p.contestId}</span>
                      <span className="text-[9px] text-emerald-500/25 tabular-nums">R:{p.rating}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {p.tags.slice(0, 4).map((t) => (
                        <span key={t} className="text-[8px] font-bold text-emerald-500/25 uppercase tracking-wider">
                          [{t}]
                        </span>
                      ))}
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px]">
                      <span className={p.solved ? "text-emerald-400" : "text-red-400"}>
                        {p.solved ? "[ACCEPTED]" : "[UNSOLVED]"}
                      </span>
                      <span className="text-emerald-500/20">|</span>
                      <span className="text-emerald-500/40">{p.attempts} attempt{p.attempts !== 1 ? "s" : ""}</span>
                      <span className="text-emerald-500/20">|</span>
                      <span className="text-emerald-500/40">
                        {Math.round(p.timeSpentSeconds / 60)}m / {Math.round(p.expectedTimeSeconds / 60)}m expected
                      </span>
                      {p.speedStatus && (
                        <>
                          <span className="text-emerald-500/20">|</span>
                          <span className={cn(
                            "font-bold uppercase",
                            p.speedStatus === "fast" ? "text-emerald-400" :
                            p.speedStatus === "slow" ? "text-amber-400" :
                            "text-emerald-500/40"
                          )}>
                            [{p.speedStatus}]
                          </span>
                        </>
                      )}
                    </div>

                    {/* Insight + Recommendation */}
                    {p.insightMessage && (
                      <p className="text-[11px] text-emerald-500/50 mt-2 leading-relaxed">
                        → {p.insightMessage}
                      </p>
                    )}
                    {p.recommendation && (
                      <p className="text-[10px] text-emerald-500/30 mt-1">
                        {"// "}{p.recommendation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded border border-emerald-500/20 bg-transparent text-emerald-500/50 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-500/10 hover:text-emerald-300 transition-all inline-flex items-center gap-1.5"
                    >
                      [ OPEN_CF ]
                      <ArrowRight size={9} />
                    </a>
                    {!p.solved &&
                      (isInUpsolveQueue(p) ? (
                        <span className="h-8 px-3 rounded border border-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                          <CheckCircle2 size={9} />
                          [QUEUED]
                        </span>
                      ) : (
                        <button
                          onClick={() => void addOneUpsolve(p)}
                          className="h-8 px-3 rounded border border-amber-500/25 bg-transparent text-amber-400 font-bold uppercase tracking-widest text-[8px] hover:bg-amber-500/10 hover:text-amber-300 transition-all inline-flex items-center gap-1.5"
                        >
                          [ +UPSOLVE ]
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
            className="pt-6 border-t border-emerald-500/10 space-y-4"
          >
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
              <BookOpen size={12} className="text-emerald-400" />
              <span>NEXT_ACTIONS // CONTINUATION_PROMPT</span>
            </div>

            <p className="text-[11px] text-emerald-500/40 leading-relaxed">
              Lock in one upsolve block for missed problems, then compile a new session while patterns are fresh.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all font-mono"
              >
                <Link href="/training">
                  <Trophy size={12} className="mr-2" />
                  [ NEXT_SESSION.EXE ]
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 transition-all font-mono"
              >
                <Link href="/upsolve">[ UPSOLVE_QUEUE.SH ]</Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded border border-emerald-500/15 bg-transparent text-emerald-500/40 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 transition-all font-mono"
                onClick={() => router.push("/dashboard")}
              >
                [ DASHBOARD.SH ]
              </Button>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

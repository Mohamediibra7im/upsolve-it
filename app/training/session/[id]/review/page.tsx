"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/shared/Loader";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
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
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">{error}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/training/reviews">All session reviews</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/training">Training</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return <Loader message="Loading review..." />;

  const { summary, problems } = data;
  // Header must match cards even if an older API mixed solvedCount with per-row flags.
  const solvedFromRows = problems.filter((p) => p.solved).length;
  const totalProblems = summary.totalProblems ?? problems.length;
  const solvedDisplay = solvedFromRows;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 max-w-4xl">
      <Link
        href="/training/reviews"
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        All session reviews
      </Link>
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Session review
        </p>
        <h1 className="text-4xl font-black tracking-tight">Performance recap</h1>
        <p className="text-muted-foreground">
          Honest stats and next steps based on your solves.
        </p>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-md rounded-3xl">
        <CardContent className="p-8 space-y-6">
          <h2 className="text-lg font-black uppercase tracking-widest">
            Session summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Solved
              </p>
              <p className="text-2xl font-black">
                {solvedDisplay}/{totalProblems}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Performance
              </p>
              <p className="text-2xl font-black">{summary.performanceScore}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Total time
              </p>
              <p className="text-2xl font-black">
                {Math.round(summary.totalTimeSpent / 60)}m
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Avg / solved
              </p>
              <p className="text-2xl font-black">
                {summary.averageTimePerProblem}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-widest">
          Problem breakdown
        </h2>
        <div className="grid gap-4">
          {problems.map((p) => (
            <Card
              key={p.problemId}
              className="border-border/50 bg-card/20 backdrop-blur-sm rounded-2xl"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {p.contestId}
                      {p.index} · rating {p.rating}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-border/40"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`https://codeforces.com/contest/${p.contestId}/problem/${p.index}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open on CF
                      </a>
                    </Button>
                    {!p.solved ? (
                      isInUpsolveQueue(p) ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled
                          className="cursor-default border-0 bg-emerald-600 font-black uppercase tracking-widest text-[10px] text-white opacity-100 shadow-sm hover:bg-emerald-600"
                        >
                          Added
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => void addOneUpsolve(p)}
                        >
                          Add to upsolve
                        </Button>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="text-sm space-y-2 border-t border-border/40 pt-4">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Status: </span>
                    {p.solved ? p.speedStatus : "unsolved"} · attempts{" "}
                    {p.attempts} · time {p.timeSpentSeconds}s / expected{" "}
                    {p.expectedTimeSeconds}s
                  </p>
                  <p className="leading-relaxed">{p.insightMessage}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="border-border/50 bg-primary/5 rounded-3xl">
        <CardContent className="p-8 space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest">
            What to do next
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Lock in one upsolve block for misses, then schedule the next session
            while patterns are fresh.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="font-black uppercase tracking-widest text-[10px]">
              <Link href="/training">Start next session</Link>
            </Button>
            <Button asChild variant="outline" className="font-black uppercase tracking-widest text-[10px]">
              <Link href="/upsolve">Go to Upsolve Queue</Link>
            </Button>
            <Button
              variant="ghost"
              className="font-black uppercase tracking-widest text-[10px]"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

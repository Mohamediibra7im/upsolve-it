"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { Training } from "@/types/Training";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ClipboardList,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

function sessionLabel(t: Training): string {
  const mode = t.trainingMode ?? "ladder";
  if (mode === "contest") return "Contest Simulation";
  if (mode === "speed") return "Speed Round";
  if (mode === "endurance") return "Endurance Mode";
  if (mode === "weakness") return "Weakness Training";
  return "Ladder Training";
}

function solvedCount(t: Training): number {
  return t.problems.filter(
    (p) => p.isSolved || p.solvedTime != null,
  ).length;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

export default function TrainingReviewsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { history, isLoading: historyLoading } = useHistory();

  if (userLoading || historyLoading || !user) {
    return <Loader message="Loading reviews..." />;
  }

  const sorted = [...history]
    .filter((t) => Boolean(t._id))
    .sort((a, b) => b.endTime - a.endTime);

  return (
    <section className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
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
              href="/training"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="size-3.5" />
              Training
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <ClipboardList className="size-3 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Reviews</span>
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  Past Sessions
                </h1>
                <p className="text-sm text-muted-foreground">
                  Review your completed training sessions and track progress
                </p>
              </div>

              <Button
                asChild
                className="h-10 px-5 text-[11px] font-bold uppercase tracking-wider rounded-xl shrink-0"
              >
                <Link href="/training">
                  <Flame className="size-3.5 mr-1.5" />
                  New Session
                </Link>
              </Button>
            </div>
          </m.div>

          {sorted.length === 0 ? (
            <m.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl overflow-hidden"
            >
              <div className="p-12 sm:p-16 text-center space-y-4">
                <div className="size-16 rounded-2xl bg-white/[0.03] border border-white/[0.04] flex items-center justify-center mx-auto">
                  <ClipboardList className="size-7 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No completed sessions yet
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Finish a training run to see reviews here
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 h-10 px-5 text-[11px] font-bold uppercase tracking-wider rounded-xl bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                >
                  <Link href="/training">Start Training</Link>
                </Button>
              </div>
            </m.div>
          ) : (
            <m.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="space-y-3"
            >
              {sorted.map((t) => {
                const id = t._id as string;
                const total = t.problems?.length ?? 0;
                const solved = solvedCount(t);
                const date = new Date(t.endTime);
                const isComplete = solved === total;
                const durationMinutes = t.durationMinutes
                  ? t.durationMinutes
                  : t.startTime && t.endTime
                    ? Math.round((t.endTime - t.startTime) / 60000)
                    : null;

                return (
                  <m.div key={id} variants={fadeUp}>
                    <Link
                      href={`/training/session/${id}/review`}
                      className="block group"
                    >
                      <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300 overflow-hidden">
                        <div className="p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-white/[0.03] border border-white/[0.04] px-2 py-0.5 rounded-md">
                                  {sessionLabel(t)}
                                </span>
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                    isComplete
                                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                      : "text-amber-400 bg-amber-500/10 border border-amber-500/20",
                                  )}
                                >
                                  {isComplete ? "Complete" : "Partial"}
                                </span>
                              </div>

                              <div className="flex items-center gap-4 text-[12px] text-muted-foreground/60">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="size-3" />
                                  <time dateTime={date.toISOString()}>
                                    {date.toLocaleString(undefined, {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                                  </time>
                                </div>
                                {durationMinutes !== null && (
                                  <>
                                    <span className="text-white/10">|</span>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="size-3" />
                                      <span>{durationMinutes}m</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-right hidden sm:block">
                                <div className="flex items-center gap-1.5 justify-end mb-1">
                                  {isComplete ? (
                                    <CheckCircle2 className="size-3 text-emerald-400" />
                                  ) : (
                                    <XCircle className="size-3 text-amber-400" />
                                  )}
                                  <span className="text-sm font-bold text-foreground tabular-nums">
                                    {solved}/{total}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 justify-end">
                                  <Trophy className="size-3 text-primary" />
                                  <span className="text-[11px] font-semibold text-muted-foreground/60">
                                    {t.performance}
                                  </span>
                                </div>
                              </div>

                              <div className="flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-muted-foreground/40 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <ArrowRight className="size-4" />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-4 sm:hidden">
                            <div className="flex items-center gap-1.5">
                              {isComplete ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : (
                                <XCircle className="size-3 text-amber-400" />
                              )}
                              <span className="text-xs font-semibold text-foreground">
                                {solved}/{total}
                              </span>
                            </div>
                            <span className="text-white/10 text-[8px]">|</span>
                            <div className="flex items-center gap-1">
                              <Trophy className="size-3 text-primary" />
                              <span className="text-xs font-semibold text-muted-foreground/60">
                                {t.performance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </m.div>
                );
              })}
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}

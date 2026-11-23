"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHistory } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import StudioMascot from "@/components/shared/StudioMascot";
import { Training } from "@/types/Training";
import {
  ArrowRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

function modeLabel(t: Training): string {
  const mode = t.trainingMode ?? "ladder";
  if (mode === "contest") return "Contest simulation";
  if (mode === "speed") return "Speed round";
  if (mode === "endurance") return "Endurance";
  if (mode === "weakness") return "Weakness training";
  return "Ladder training";
}

function solvedCount(t: Training): number {
  return t.problems.filter((p) => p.isSolved || p.solvedTime != null).length;
}

const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

export default function TrainingReviewsPage() {
  const { user, isLoading: userLoading } = useUser();
  const {
    history,
    isLoading: historyLoading,
    error: historyError,
    refresh,
  } = useHistory();

  if (userLoading || historyLoading || !user) {
    return (
      <div role="status" className="mx-auto max-w-5xl space-y-7 px-4 py-10">
        <span className="sr-only">Loading session reviews</span>
        <div
          aria-hidden="true"
          className="h-12 w-2/3 animate-pulse rounded-xl bg-[#2b3031] motion-reduce:animate-none"
        />
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            aria-hidden="true"
            className="h-28 animate-pulse rounded-2xl border border-[#2b3031] bg-[#191c1e] motion-reduce:animate-none"
          />
        ))}
      </div>
    );
  }

  const sorted = [...history]
    .filter((t) => Boolean(t._id))
    .sort((a, b) => b.endTime - a.endTime);

  const totalSolved = sorted.reduce(
    (total, session) => total + solvedCount(session),
    0,
  );
  const totalSelected = sorted.reduce(
    (total, session) => total + session.problems.length,
    0,
  );

  return (
    <section className="min-h-screen relative overflow-hidden font-sans text-[#f1f3ee]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Back link */}
          <m.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium tracking-normal text-[#929b98]">
                <ClipboardList size={12} className="text-[#b5e3c4]" />
                <span>Your practice, over time</span>
                <span className="flex-1 border-b border-[#2b3031]" />

                <span>{sorted.length} sessions</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
                    Every session tells a story.
                  </h1>
                  <p className="text-sm text-[#929b98]">
                    Revisit your sessions, learn from each attempt, and see how
                    far you’ve come.
                  </p>
                </div>

                <Button
                  asChild
                  className="h-10 rounded-xl bg-[#b5e3c4] text-[#101214] font-medium tracking-normal text-xs  hover:bg-[#ceedd8] transition-all font-sans shrink-0"
                >
                  <Link href="/training">
                    <Flame size={12} className="mr-2" />
                    New session
                  </Link>
                </Button>
              </div>
            </div>
          </m.div>

          {historyError ? (
            <div
              role="alert"
              className="rounded-2xl border border-[#2b3031] bg-[#191c1e] px-6 py-12 text-center"
            >
              <h2 className="font-heading text-2xl font-medium">
                Your sessions couldn’t load.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#929b98]">
                Try again to see your saved sessions and progress.
              </p>
              <Button
                variant="outline"
                onClick={() => void refresh()}
                className="mt-6 rounded-xl"
              >
                <RefreshCw className="size-4" />
                Try again
              </Button>
            </div>
          ) : sorted.length === 0 ? (
            <m.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="rounded-2xl border border-[#2b3031] bg-[#191c1e] px-6 py-12 text-center space-y-4"
            >
              <StudioMascot pose="think" className="mx-auto w-36" />
              <h2 className="font-heading text-2xl font-medium">
                Your session history starts here.
              </h2>
              <p className="text-sm text-[#929b98]">
                Finish a training session to see your results and review your
                progress.
              </p>
              <Button
                asChild
                variant="outline"
                className="h-10 px-6 rounded-xl border border-[#2b3031] bg-transparent text-[#b5e3c4] font-medium tracking-normal text-xs hover:bg-[#b5e3c4]/10 transition-all font-sans"
              >
                <Link href="/training">Start training</Link>
              </Button>
            </m.div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 border-y border-[#2b3031] py-5">
                <p className="text-sm text-[#929b98]">
                  <span className="mr-2 font-heading text-2xl font-medium tabular-nums text-[#f1f3ee]">
                    {sorted.length}
                  </span>
                  sessions completed
                </p>
                <p className="text-sm text-[#929b98]">
                  <span className="mr-2 font-heading text-2xl font-medium tabular-nums text-[#b5e3c4]">
                    {totalSolved}
                  </span>
                  problems solved
                </p>
                <p className="text-sm text-[#929b98]">
                  <span className="mr-2 font-heading text-2xl font-medium tabular-nums text-[#f1f3ee]">
                    {totalSelected > 0
                      ? Math.round((totalSolved / totalSelected) * 100)
                      : 0}
                    %
                  </span>
                  solve rate
                </p>
              </div>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_90px_70px_110px_24px] items-center px-5 py-2 text-xs font-medium tracking-normal text-[#929b98] border-b border-[#2b3031]">
                <span>Session</span>
                <span className="text-center">Time</span>
                <span className="text-center">Solved</span>
                <span className="text-center">Performance</span>
                <span />
              </div>

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
                        className="group grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1fr)_90px_70px_110px_24px] items-center gap-3 sm:gap-0 rounded-2xl border border-[#2b3031] bg-[#191c1e] p-5 hover:border-[#69746e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
                      >
                        {/* Session info */}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                            <span className="text-base font-medium text-[#f1f3ee]">
                              {modeLabel(t)}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-medium tracking-normal",
                                isComplete
                                  ? "text-[#b5e3c4]"
                                  : "text-[#d5b98a]",
                              )}
                            >
                              {isComplete ? "Complete" : "Needs upsolving"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#929b98]">
                            <span>
                              {date.toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {durationMinutes !== null && (
                              <>
                                <span className="text-[#929b98]">|</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={9} />
                                  {durationMinutes}m
                                </span>
                              </>
                            )}
                            {/* Mobile stats */}
                            <span className="sm:hidden text-[#929b98]">|</span>
                            <span className="sm:hidden flex items-center gap-1">
                              {isComplete ? (
                                <CheckCircle2 size={9} />
                              ) : (
                                <XCircle size={9} />
                              )}
                              {solved}/{total}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-sm text-[#929b98] tabular-nums">
                            {date.toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Solved (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-sm font-medium tabular-nums">
                            {solved}/{total}
                          </span>
                        </div>

                        {/* Performance (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-sm font-medium text-[#929b98] tabular-nums">
                            {t.performance}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-end">
                          <ArrowRight
                            size={12}
                            className="text-[#929b98] group-hover:text-[#b5e3c4] group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </Link>
                    </m.div>
                  );
                })}
              </m.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

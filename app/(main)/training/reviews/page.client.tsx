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
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

function modeToExe(t: Training): string {
  const mode = t.trainingMode ?? "ladder";
  if (mode === "contest") return "CONTEST_SIM.BAT";
  if (mode === "speed") return "SPEED_BURST.COM";
  if (mode === "endurance") return "ENDURANCE_TEST.BAT";
  if (mode === "weakness") return "WEAKNESS_CORRECT.SYS";
  return "LADDER_TRAINING.EXE";
}

function solvedCount(t: Training): number {
  return t.problems.filter(
    (p) => p.isSolved || p.solvedTime != null,
  ).length;
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
  const { history, isLoading: historyLoading } = useHistory();

  if (userLoading || historyLoading || !user) {
    return <Loader message="Loading reviews..." />;
  }

  const sorted = [...history]
    .filter((t) => Boolean(t._id))
    .sort((a, b) => b.endTime - a.endTime);

  return (
    <section className="min-h-screen relative overflow-hidden font-mono text-emerald-400">
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back link */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >

            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
                <ClipboardList size={12} className="text-emerald-400" />
                <span>SESSION_ARCHIVE // REVIEW_LOGS</span>
                <span className="flex-1 border-b border-emerald-500/10" />
                <Cpu size={10} className="text-emerald-500/30" />
                <span>{sorted.length} ENTRIES</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                    Past Sessions Archive
                  </h1>
                  <p className="text-[11px] text-emerald-500/40">
                    Review completed training compilations and track progress across sessions.
                  </p>
                </div>

                <Button
                  asChild
                  className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all font-mono shrink-0"
                >
                  <Link href="/training">
                    <Flame size={12} className="mr-2" />
                    [ NEW_SESSION.EXE ]
                  </Link>
                </Button>
              </div>
            </div>
          </m.div>

          {sorted.length === 0 ? (
            <m.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="py-16 text-center space-y-4"
            >
              <div className="size-14 rounded border border-emerald-500/15 bg-emerald-950/10 flex items-center justify-center mx-auto text-emerald-500/30">
                <ClipboardList size={24} />
              </div>
              <p className="text-[11px] text-emerald-500/30">
                [SYS.EMPTY // NO COMPLETED SESSIONS FOUND]
              </p>
              <p className="text-[10px] text-emerald-500/20">
                Finish a training run to populate this archive.
              </p>
              <Button
                asChild
                variant="outline"
                className="h-10 px-6 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 transition-all font-mono"
              >
                <Link href="/training">[ START_TRAINING.SH ]</Link>
              </Button>
            </m.div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_100px_60px_60px_30px] items-center px-2 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-500/25 border-b border-emerald-500/10">
                <span>SESSION_BINARY</span>
                <span className="text-center">TIMESTAMP</span>
                <span className="text-center">SOLVED</span>
                <span className="text-center">PERF</span>
                <span />
              </div>

              <m.div
                initial="hidden"
                animate="show"
                variants={stagger}
                className="divide-y divide-emerald-500/[0.07]"
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
                        className="group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_60px_60px_30px] items-center gap-3 sm:gap-0 py-3.5 px-2 hover:bg-emerald-950/5 transition-all duration-200"
                      >
                        {/* Session info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              {modeToExe(t)}
                            </span>
                            <span className={cn(
                              "text-[8px] font-bold uppercase tracking-wider",
                              isComplete ? "text-emerald-400" : "text-amber-400"
                            )}>
                              {isComplete ? "[COMPLETE]" : "[PARTIAL]"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] text-emerald-500/30">
                            <span>{date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                            {durationMinutes !== null && (
                              <>
                                <span className="text-emerald-500/10">|</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={9} />
                                  {durationMinutes}m
                                </span>
                              </>
                            )}
                            {/* Mobile stats */}
                            <span className="sm:hidden text-emerald-500/10">|</span>
                            <span className="sm:hidden flex items-center gap-1">
                              {isComplete ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                              {solved}/{total}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[10px] text-emerald-500/40 tabular-nums">
                            {date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Solved (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[11px] font-bold tabular-nums">
                            {solved}/{total}
                          </span>
                        </div>

                        {/* Performance (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[11px] font-bold text-emerald-500/50 tabular-nums">
                            {t.performance}
                          </span>
                        </div>

                        {/* Arrow */}
                        <div className="flex items-center justify-end">
                          <ArrowRight size={12} className="text-emerald-500/20 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
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

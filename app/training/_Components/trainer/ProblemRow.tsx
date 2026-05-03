"use client";

import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Lock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SubmissionStatus } from "@/utils/codeforces/getTrainingSubmissionStatus";
import { motion } from "framer-motion";

/** Session-only slot label A-Z (not the contest index); numeric fallback after Z. */
function sessionSlotLabel(zeroBasedIndex: number): string {
  if (zeroBasedIndex >= 0 && zeroBasedIndex < 26) {
    return String.fromCharCode(65 + zeroBasedIndex);
  }
  return String(zeroBasedIndex + 1);
}

const ProblemRow = ({
  problem,
  index,
  isTraining,
  startTime,
  submissionStatus,
  showRatings,
  hideContestDetails,
  onProblemOpen,
  speedLabel,
}: {
  problem: TrainingProblem;
  index: number;
  isTraining: boolean;
  startTime: number | null;
  submissionStatus?: SubmissionStatus;
  showRatings: boolean;
  /** Contest simulation: hide title/tags/rating during active session */
  hideContestDetails?: boolean;
  onProblemOpen?: (problem: TrainingProblem) => void;
  speedLabel?: string | null;
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isTraining || !startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining, startTime]);

  const isPreContestPeriod = isTraining && startTime && currentTime < startTime;
  /** Order within this training set only (A-Z by slot), not the contest problem letter. */
  const sessionLabel = sessionSlotLabel(index);
  const isNumericFallback = index >= 26;

  const getSolvedStatus = () => {
    if (!isTraining) return "";

    const pillClass =
      "flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 py-1 sm:gap-2 sm:px-3";

    if (submissionStatus) {
      switch (submissionStatus.status) {
        case "AC":
          return (
            <div
              className={`${pillClass} bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {problem.solvedTime && startTime
                  ? `${Math.floor((problem.solvedTime - startTime) / 60000)}m`
                  : "Solved"}
              </span>
            </div>
          );
        case "WA":
          return (
            <div
              className={`${pillClass} bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400`}
            >
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Incomplete
              </span>
            </div>
          );
        case "TESTING":
          return (
            <div
              className={`${pillClass} bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400`}
            >
              <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Verifying
              </span>
            </div>
          );
      }
    }

    if (problem.solvedTime && startTime) {
      return (
        <div
          className={`${pillClass} bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {Math.floor((problem.solvedTime - startTime) / 60000)}m
          </span>
        </div>
      );
    }

    return null;
  };

  const statusBadge = getSolvedStatus();

  const speedLabelShort =
    problem.speedStatus === "fast"
      ? "Fast"
      : problem.speedStatus === "slow"
        ? "Slow"
        : problem.speedStatus === "normal"
          ? "Normal"
          : null;

  const content = (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl border py-3 px-3 transition-all duration-500 sm:px-5 sm:py-3.5",
        isPreContestPeriod
          ? "border-border/40 bg-muted/5 opacity-80"
          : "border-border/60 bg-background/40 hover:border-primary/40 hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        {/* Index Label */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black shadow-inner transition-all duration-500 sm:h-11 sm:w-11",
            isNumericFallback && sessionLabel.length >= 2 ? "text-sm tabular-nums" : "text-lg",
            isPreContestPeriod
              ? "bg-muted/20 text-muted-foreground/30"
              : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6"
          )}
        >
          {sessionLabel}
        </div>

        {/* Info Area */}
        <div className="min-w-0 flex-1 space-y-2 sm:space-y-1">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="min-w-0 flex-1">
              {(isPreContestPeriod ||
                (hideContestDetails && isTraining) ||
                (!isTraining && !showRatings)) ? (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="relative h-4 w-28 max-w-full overflow-hidden rounded-lg bg-muted/30 animate-pulse">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Encrypted
                    </div>
                  </div>
                </div>
              ) : (
                <h4 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:line-clamp-1 sm:truncate sm:text-base">
                  {problem.name}
                </h4>
              )}
            </div>
            {(statusBadge || speedLabel) && (
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:shrink-0 sm:justify-end">
                {statusBadge}
                {speedLabel ? (
                  <>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:hidden">
                      {speedLabelShort ?? speedLabel}
                    </span>
                    <span className="hidden text-[9px] font-bold uppercase tracking-wider text-muted-foreground tabular-nums sm:inline">
                      {speedLabel}
                    </span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <div className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Rating
              </div>
              <span
                className={cn(
                  "text-xs font-bold text-foreground tabular-nums transition-all duration-300",
                  ((!isTraining && !showRatings) ||
                    (hideContestDetails && isTraining)) &&
                    "blur-sm opacity-40 select-none",
                )}
              >
                {isPreContestPeriod ? "????" : problem.rating}
              </span>
            </div>
            
            <div className="h-0.5 w-0.5 rounded-full bg-border" />
            
            <div className="flex items-center gap-1.5">
              <div className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Round
              </div>
              <span
                className={cn(
                  "text-xs font-bold text-foreground tabular-nums transition-all duration-300",
                  ((!isTraining && !showRatings) ||
                    (hideContestDetails && isTraining)) &&
                    "blur-sm opacity-40 select-none",
                )}
              >
                {isPreContestPeriod ? "???" : problem.contestId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 md:flex">
            {!isPreContestPeriod &&
              !hideContestDetails &&
              (showRatings || isTraining) &&
              problem.tags?.slice(0, 2).map((tag) => (
                <div
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-muted/20 border border-border/40 text-[9px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                >
                  {tag}
                </div>
              ))}
          </div>

          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-500 sm:h-10 sm:w-10",
              isPreContestPeriod
                ? "bg-muted/20 text-muted-foreground/40"
                : "bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            {isPreContestPeriod ? (
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
        </div>
      </div>
      
      {/* Background Decor */}
      {!isPreContestPeriod && (
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-24 w-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
        </div>
      )}
    </motion.div>
  );

  if (isPreContestPeriod) return content;

  return (
    <Link
      href={problem.url}
      target="_blank"
      className="block no-underline"
      onClick={() => onProblemOpen?.(problem)}
    >
      {content}
    </Link>
  );
};

export default ProblemRow;








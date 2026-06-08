"use client";

import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Lock, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import { m } from "framer-motion";

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
  showTags,
}: {
  problem: TrainingProblem;
  index: number;
  isTraining: boolean;
  startTime: number | null;
  submissionStatus?: SubmissionStatus;
  showRatings: boolean;
  hideContestDetails?: boolean;
  onProblemOpen?: (problem: TrainingProblem) => void;
  speedLabel?: string | null;
  showTags?: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isTraining || !startTime) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isTraining, startTime]);

  const isPreContestPeriod = isTraining && startTime && currentTime < startTime;
  const sessionLabel = sessionSlotLabel(index);

  const isSolved = Boolean(
    submissionStatus?.status === "AC" || problem.solvedTime,
  );

  const getSolvedStatus = () => {
    if (!isTraining) return null;

    if (submissionStatus) {
      switch (submissionStatus.status) {
        case "AC":
          return (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span className="text-[10px] font-bold tracking-wide">
                Accepted {problem.solvedTime && startTime ? `in ${Math.floor((problem.solvedTime - startTime) / 60000)}m` : ""}
              </span>
            </div>
          );
        case "WA":
          return (
            <div className="flex items-center gap-1.5 text-rose-400">
              <XCircle className="size-3.5" />
              <span className="text-[10px] font-bold tracking-wide">Wrong Answer</span>
            </div>
          );
        case "TESTING":
          return (
            <div className="flex items-center gap-1.5 text-sky-400">
              <Loader2 className="size-3.5 animate-spin" />
              <span className="text-[10px] font-bold tracking-wide">Judging</span>
            </div>
          );
      }
    }

    if (problem.solvedTime && startTime) {
      return (
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="size-3.5" />
          <span className="text-[10px] font-bold tracking-wide">
            Accepted in {Math.floor((problem.solvedTime - startTime) / 60000)}m
          </span>
        </div>
      );
    }

    return null;
  };

  const statusBadge = getSolvedStatus();

  const content = (
    <m.div
      className={cn(
        "group relative flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-300",
        isPreContestPeriod
          ? "border-white/[0.03] bg-white/[0.01] opacity-40"
          : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08]",
        isSolved && "border-emerald-500/10 bg-emerald-500/[0.03] hover:border-emerald-500/20",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm transition-all duration-300",
          isPreContestPeriod
            ? "bg-white/[0.03] text-muted-foreground/30"
            : isSolved
              ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_-2px_rgba(52,211,153,0.2)]"
              : "bg-primary/10 text-primary",
        )}
      >
        {sessionLabel}
      </div>

      <div className="min-w-0 flex-1">
        {(isPreContestPeriod || (hideContestDetails && isTraining) || (!isTraining && !showRatings)) ? (
          <div className="space-y-2">
            <div className="h-4 w-32 rounded-lg bg-white/[0.03] animate-pulse" />
            <div className="h-3 w-20 rounded-lg bg-white/[0.02] animate-pulse" />
          </div>
        ) : (
          <>
            <h4 className="text-[14px] font-medium text-foreground/90 truncate group-hover:text-foreground transition-colors">
              {problem.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-[11px] text-muted-foreground/60 tabular-nums",
                ((!isTraining && !showRatings) || (hideContestDetails && isTraining)) && "blur-sm opacity-40"
              )}>
                {isPreContestPeriod ? "????" : `R${problem.rating}`}
              </span>
              <span className="text-white/10 text-[8px]">|</span>
              <span className={cn(
                "text-[11px] text-muted-foreground/60 tabular-nums",
                ((!isTraining && !showRatings) || (hideContestDetails && isTraining)) && "blur-sm opacity-40"
              )}>
                {isPreContestPeriod ? "???" : `#${problem.contestId}`}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="hidden items-center gap-1.5 lg:flex">
        {showTags !== false && !isPreContestPeriod && !hideContestDetails && (showRatings || isTraining) &&
          problem.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg text-[9px] font-semibold text-muted-foreground/60 bg-white/[0.03] border border-white/[0.04] uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {statusBadge}
        {speedLabel && !statusBadge && (
          <span className="text-[10px] font-medium text-muted-foreground/50">{speedLabel}</span>
        )}

        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            isPreContestPeriod
              ? "bg-white/[0.03] text-muted-foreground/30"
              : "bg-white/[0.04] text-muted-foreground/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_12px_-2px_rgba(var(--primary),0.4)]",
          )}
        >
          {isPreContestPeriod ? (
            <Lock className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
        </div>
      </div>
    </m.div>
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

"use client";

import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";

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
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b5e3c4]">
              <CheckCircle2 className="size-3.5" />
              Accepted
              {problem.solvedTime && startTime
                ? ` · ${Math.floor((problem.solvedTime - startTime) / 60000)} min`
                : ""}
            </span>
          );
        case "WA":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#e5a39d]">
              <XCircle className="size-3.5" />
              Wrong answer
            </span>
          );
        case "TESTING":
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-[#b8c0bb]">
              <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
              Judging…
            </span>
          );
      }
    }

    if (problem.solvedTime && startTime) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b5e3c4]">
          <CheckCircle2 className="size-3.5" />
          Accepted · {Math.floor((problem.solvedTime - startTime) / 60000)} min
        </span>
      );
    }
    return null;
  };

  const statusBadge = getSolvedStatus();

  const content = (
    <div
      className={cn(
        "group flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 font-sans transition-colors duration-200 sm:p-5",
        isPreContestPeriod
          ? "border-[#2b3031] bg-[#15181a] opacity-60"
          : "border-[#2b3031] bg-[#15181a] hover:border-[#69746e] hover:bg-[#1d2220]",
        isSolved && "border-[#b5e3c4]/25 bg-[#b5e3c4]/[0.04]",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border font-heading text-base font-medium",
            isSolved
              ? "border-[#b5e3c4]/20 bg-[#b5e3c4]/10 text-[#b5e3c4]"
              : "border-[#39403c] text-[#b8c0bb]",
          )}
        >
          {sessionLabel}
        </div>
        <div className="min-w-0 flex-1">
          {isPreContestPeriod || (hideContestDetails && isTraining) ? (
            <div>
              <h4 className="text-sm font-medium text-[#f1f3ee]">
                Problem {sessionLabel}
              </h4>
              <p className="mt-1 text-xs text-[#929b98]">
                {isPreContestPeriod
                  ? "Available when your session starts"
                  : "Details hidden in contest mode"}
              </p>
            </div>
          ) : (
            <>
              <h4 className="truncate text-sm font-medium text-[#f1f3ee] transition-colors group-hover:text-[#b5e3c4]">
                {problem.name}
              </h4>
              <div className="mt-1 flex items-center gap-3 text-xs text-[#929b98] tabular-nums">
                {(!isTraining && !showRatings) ||
                (hideContestDetails && isTraining) ? (
                  <span>Rating hidden</span>
                ) : (
                  <>
                    <span>Rating {problem.rating}</span>
                    <span>Contest {problem.contestId}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-wrap items-center gap-3 sm:w-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          {showTags !== false &&
            !isPreContestPeriod &&
            !hideContestDetails &&
            (showRatings || isTraining) &&
            problem.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[#2b3031] px-2 py-1 text-xs text-[#929b98]"
              >
                {tag}
              </span>
            ))}
        </div>
        {statusBadge}
        {speedLabel && !statusBadge && (
          <span className="text-xs text-[#929b98]">{speedLabel}</span>
        )}
        <span className="text-[#929b98] transition-colors group-hover:text-[#b5e3c4]">
          {isPreContestPeriod ? (
            <Lock className="size-4" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
        </span>
      </div>
    </div>
  );

  if (isPreContestPeriod) return content;

  return (
    <Link
      href={problem.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#191c1e]"
      onClick={() => onProblemOpen?.(problem)}
    >
      {content}
    </Link>
  );
};

export default ProblemRow;

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
            <div className="flex items-center gap-1 text-emerald-400 font-bold select-none glow-text-emerald">
              <CheckCircle2 size={12} />
              <span>
                [ ACCEPTED {problem.solvedTime && startTime ? `+${Math.floor((problem.solvedTime - startTime) / 60000)}M` : ""} ]
              </span>
            </div>
          );
        case "WA":
          return (
            <div className="flex items-center gap-1 text-red-400 font-bold select-none">
              <XCircle size={12} />
              <span>[ WRONG_ANSWER ]</span>
            </div>
          );
        case "TESTING":
          return (
            <div className="flex items-center gap-1 text-cyan-400 font-bold select-none">
              <Loader2 size={12} className="animate-spin" />
              <span>[ JUDGING... ]</span>
            </div>
          );
      }
    }

    if (problem.solvedTime && startTime) {
      return (
        <div className="flex items-center gap-1 text-emerald-400 font-bold select-none glow-text-emerald">
          <CheckCircle2 size={12} />
          <span>
            [ ACCEPTED +{Math.floor((problem.solvedTime - startTime) / 60000)}M ]
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
        "group relative flex items-center justify-between gap-4 py-3 border-b border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-200 font-mono text-emerald-400 select-none",
        isPreContestPeriod ? "opacity-30" : "hover:bg-emerald-950/5 px-2",
        isSolved && "text-emerald-300 glow-text-emerald bg-emerald-950/5 px-2",
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Bracketed Index Label: [A], [B], [C] */}
        <div
          className={cn(
            "flex items-center justify-center font-black text-sm select-none",
            isPreContestPeriod
              ? "text-emerald-500/20"
              : isSolved
                ? "text-emerald-300 glow-text-emerald"
                : "text-emerald-400",
          )}
        >
          [{sessionLabel}]
        </div>

        <div className="min-w-0 flex-1">
          {isPreContestPeriod || (hideContestDetails && isTraining) ? (
            <div className="space-y-1.5 py-1">
              <div className="h-3.5 w-32 rounded bg-emerald-500/10 animate-pulse" />
              <div className="h-3 w-20 rounded bg-emerald-500/5 animate-pulse" />
            </div>
          ) : (
            <>
              <h4 className="text-[13px] font-bold text-emerald-300 truncate group-hover:text-emerald-100 transition-colors">
                {problem.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-emerald-500/50">
                <span className={cn(
                  "tabular-nums",
                  ((!isTraining && !showRatings) || (hideContestDetails && isTraining)) && "blur-sm opacity-30"
                )}>
                  {isPreContestPeriod ? "????" : `[ R${problem.rating} ]`}
                </span>
                <span className={cn(
                  "tabular-nums",
                  ((!isTraining && !showRatings) || (hideContestDetails && isTraining)) && "blur-sm opacity-30"
                )}>
                  {isPreContestPeriod ? "???" : `[ #${problem.contestId} ]`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Tags list (inline brackets) */}
        <div className="hidden lg:flex items-center gap-1.5">
          {showTags !== false && !isPreContestPeriod && !hideContestDetails && (showRatings || isTraining) &&
            problem.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded border border-emerald-500/10 text-[8px] font-bold text-emerald-500/40 uppercase tracking-wider bg-transparent"
              >
                [{tag}]
              </span>
            ))}
        </div>

        {statusBadge}
        {speedLabel && !statusBadge && (
          <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">{speedLabel}</span>
        )}

        <div
          className={cn(
            "flex items-center justify-center transition-all duration-200 select-none text-emerald-500/40 group-hover:text-emerald-300 group-hover:scale-110",
          )}
        >
          {isPreContestPeriod ? (
            <Lock size={12} />
          ) : (
            <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100" />
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

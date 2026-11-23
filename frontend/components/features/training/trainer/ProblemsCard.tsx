"use client";

import StudioMascot from "@/components/shared/StudioMascot";

import { m, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ListPlus,
  Play,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { TrainingProblem } from "@/types/TrainingProblem";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import ProblemRow from "./ProblemRow";
import { speedStatusLabel } from "@/services/training/speedStatus";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

interface ProblemsCardProps {
  currentProblems: TrainingProblem[] | null;
  isTraining: boolean;
  solvedCount: number;
  totalCount: number;
  submissionStatuses: SubmissionStatus[];
  startTime: number | null;
  onGenerateProblems: () => void;
  onStartSession: () => void;
  problems: TrainingProblem[] | null;
  showRatings: boolean;
  hideContestDetails?: boolean;
  onProblemOpen?: (problem: TrainingProblem) => void;
  isPoolLoading?: boolean;
  showTags?: boolean;
  onToggleTags?: () => void;
  weaknessFallback?: boolean;
}

const ProblemsCard = ({
  currentProblems,
  isTraining,
  solvedCount,
  totalCount,
  submissionStatuses,
  startTime,
  onGenerateProblems,
  onStartSession,
  problems,
  showRatings,
  hideContestDetails,
  onProblemOpen,
  isPoolLoading,
  showTags,
  onToggleTags,
  weaknessFallback,
}: ProblemsCardProps) => {
  const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  const problemList = currentProblems?.map((problem, index) => {
    const problemId = `${problem.contestId}_${problem.index}`;
    const submissionStatus = submissionStatuses.find(
      (status) => status.problemId === problemId,
    );
    const speedLabel =
      problem.speedStatus && problem.speedStatus !== "unsolved"
        ? speedStatusLabel(problem.speedStatus)
        : null;

    return (
      <m.div
        key={`${problem.contestId}-${problem.index}-${index}`}
        variants={fadeUp}
      >
        <ProblemRow
          problem={problem}
          index={index}
          isTraining={isTraining}
          startTime={startTime}
          submissionStatus={submissionStatus}
          showRatings={showRatings}
          hideContestDetails={hideContestDetails}
          onProblemOpen={onProblemOpen}
          speedLabel={speedLabel}
          showTags={showTags}
        />
      </m.div>
    );
  });

  if (isTraining) {
    return (
      <m.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="min-w-0 space-y-6 font-sans text-[#f1f3ee]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-medium tracking-tight">
              Your problems
            </h2>
            <p className="mt-1 text-sm text-[#929b98]">
              {solvedCount} of {totalCount} completed.
              {solvedCount === totalCount && totalCount > 0
                ? " Nicely done."
                : " Keep going."}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={showTags}
            onClick={onToggleTags}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]",
              showTags
                ? "border-[#b5e3c4]/30 bg-[#b5e3c4]/5 text-[#b5e3c4]"
                : "border-[#2b3031] text-[#929b98] hover:border-[#69746e] hover:text-[#f1f3ee]",
            )}
          >
            {showTags ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
            {showTags ? "Hide topics" : "Show topics"}
          </button>
        </div>

        {weaknessFallback && (
          <div className="flex items-start gap-2 rounded-xl border border-[#d5b98a]/20 bg-[#d5b98a]/5 px-4 py-3 text-xs leading-relaxed text-[#d5b98a]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              We’re still learning your strengths. This session uses ladder
              problems until there’s enough history to target your weak topics.
            </span>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-[#929b98]">
            <span>Session progress</span>
            <span className="tabular-nums text-[#b5e3c4]">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Problems solved"
            aria-valuenow={solvedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount || 1}
            className="h-1.5 overflow-hidden rounded-full bg-[#2b3031]"
          >
            <div
              className="h-full rounded-full bg-[#b5e3c4]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {currentProblems && currentProblems.length > 0 ? (
          <>
            <m.div
              className="space-y-3"
              variants={listStagger}
              initial="hidden"
              animate="show"
            >
              {problemList}
            </m.div>
            <div className="space-y-3 rounded-xl border border-[#2b3031] p-5">
              <p className="mb-1 text-sm font-medium text-[#f1f3ee]">
                One step at a time
              </p>
              {[
                {
                  label: "Solve your first problem",
                  complete: solvedCount > 0,
                },
                {
                  label: "Complete your problem set",
                  complete: solvedCount === totalCount && totalCount > 0,
                },
                {
                  label: "Finish your session to review your progress",
                  complete: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2.5 text-xs",
                    item.complete ? "text-[#b5e3c4]" : "text-[#929b98]",
                  )}
                >
                  {item.complete ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Circle className="size-4" />
                  )}
                  {item.label}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-[#2b3031] py-12 text-center text-sm text-[#929b98]">
            No problems are available in this session.
          </div>
        )}
      </m.div>
    );
  }

  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="w-full space-y-6 font-sans text-[#f1f3ee]"
    >
      {currentProblems && currentProblems.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#b5e3c4]/10 text-[#b5e3c4]">
              <ListPlus className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-medium">Your problem set is ready</h3>
              <p className="mt-1 text-xs text-[#929b98]">
                {currentProblems.length} problems selected for this session
              </p>
            </div>
          </div>
          <m.div
            className="grid grid-cols-1 gap-3"
            variants={listStagger}
            initial="hidden"
            animate="show"
          >
            {problemList}
          </m.div>
        </div>
      ) : (
        <div className="grid items-center gap-5 rounded-2xl border border-[#2b3031] bg-[#15181a] px-5 py-8 text-center sm:grid-cols-[140px_minmax(0,1fr)] sm:px-8 sm:text-left">
          <StudioMascot pose="focus" className="mx-auto w-32" />
          <div>
            <h3 className="font-heading text-xl font-medium">
              {isPoolLoading
                ? "Finding your next challenge…"
                : "A fresh challenge awaits."}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[#929b98]">
              {isPoolLoading
                ? "We’re loading the problem library. Your tailored set will be ready to generate shortly."
                : "Your problem set will appear here, tailored to the session you’ve chosen."}
            </p>
            {isPoolLoading && (
              <div aria-hidden="true" className="mt-5 flex gap-2">
                {[0, 1, 2, 3].map((item) => (
                  <span
                    key={item}
                    className="h-1.5 flex-1 animate-pulse rounded-full bg-[#2b3031] motion-reduce:animate-none"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col justify-end gap-3 border-t border-[#2b3031] pt-5 sm:flex-row">
        <Button
          onClick={onGenerateProblems}
          disabled={isPoolLoading}
          variant="outline"
          className="h-11 rounded-xl border-[#39403c] bg-transparent px-5 text-sm text-[#f1f3ee] hover:border-[#b5e3c4]/50 hover:bg-[#b5e3c4]/5 hover:text-[#b5e3c4]"
        >
          {isPoolLoading ? (
            <>
              <RefreshCw className="size-4 animate-spin motion-reduce:animate-none" />
              Loading problems…
            </>
          ) : problems && problems.length > 0 ? (
            <>
              <RefreshCw className="size-4" />
              Generate another set
            </>
          ) : (
            <>
              <ListPlus className="size-4" />
              Generate problems
            </>
          )}
        </Button>
        {problems && problems.length > 0 && (
          <Button
            onClick={() => void onStartSession()}
            className="h-11 rounded-xl bg-[#b5e3c4] px-6 text-sm text-[#101214] hover:bg-[#ceedd8]"
          >
            <Play className="size-4 fill-current" />
            Start session
          </Button>
        )}
      </div>
    </m.div>
  );
};

export default ProblemsCard;

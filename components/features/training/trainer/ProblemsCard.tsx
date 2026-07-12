"use client";

import { m, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Play, Eye, EyeOff, Info } from "lucide-react";
import { TrainingProblem } from "@/types/TrainingProblem";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import ProblemRow from "./ProblemRow";
import { speedStatusLabel } from "@/services/training/speedStatus";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
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

  // Block progress
  const totalBlocks = 20;
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((progressPercent / 100) * totalBlocks)));
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBlocks = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  if (isTraining) {
    return (
      <m.div initial="hidden" animate="show" variants={fadeUp} className="font-mono text-emerald-400">
        <div className="space-y-4">
          
          <div className="relative px-6 py-4 border-b border-emerald-500/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-300">SYS.COMPILATIONS // ACTIVE PROBLEMS</h2>
              <p className="text-[10px] text-emerald-500/50 mt-0.5 uppercase tracking-wide">
                COMPLETED: {solvedCount} / {totalCount} Challenge Nodes
              </p>
            </div>
            <button
              onClick={onToggleTags}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold transition-all duration-200 border font-mono tracking-wider",
                showTags
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "bg-transparent border-emerald-500/15 text-emerald-500/50 hover:border-emerald-500/35 hover:text-emerald-400"
              )}
            >
              {showTags ? <Eye size={12} /> : <EyeOff size={12} />}
              {showTags ? "[ TAGS: ON ]" : "[ TAGS: OFF ]"}
            </button>
          </div>

          {weaknessFallback && (
            <div className="mx-6 mt-4 flex items-center gap-2 rounded border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-[10px] text-amber-400">
              <Info size={14} className="shrink-0" />
              <span>[WARNING] NOT ENOUGH WEAKNESS DATA — DEVIATING TO LADDER SECTORS</span>
            </div>
          )}

          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-1.5 text-[10px] tracking-wider uppercase text-emerald-500/40 select-none">
              <span>COMPILATION PROGRESS</span>
              <span className="font-bold text-emerald-400">[{progressBlocks}] {Math.round(progressPercent)}%</span>
            </div>
          </div>

          <div className="p-6 pt-4">
            {currentProblems && currentProblems.length > 0 ? (
              <>
                <m.div className="space-y-3" variants={listStagger} initial="hidden" animate="show">
                  {currentProblems.map((problem, index) => {
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
                  })}
                </m.div>

                <div className="mt-5 pt-4 border-t border-emerald-500/10">
                  <div className="p-4 rounded border border-emerald-500/10 bg-emerald-950/5">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest mb-2.5">
                      [ RUNTIME CHECKLIST ]
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider">
                        <span className={cn("font-bold select-none w-5 text-center", solvedCount > 0 ? "text-emerald-400" : "text-emerald-500/30")}>
                          {solvedCount > 0 ? "[x]" : "[ ]"}
                        </span>
                        <span className={solvedCount > 0 ? "text-emerald-400" : "text-emerald-500/50"}>Solve at least one problem node</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider">
                        <span className={cn("font-bold select-none w-5 text-center", (solvedCount === totalCount && totalCount > 0) ? "text-emerald-400" : "text-emerald-500/30")}>
                          {solvedCount === totalCount && totalCount > 0 ? "[x]" : "[ ]"}
                        </span>
                        <span className={(solvedCount === totalCount && totalCount > 0) ? "text-emerald-400" : "text-emerald-500/50"}>Complete all challenge nodes</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-emerald-500/50">
                        <span className="font-bold select-none w-5 text-center text-emerald-500/30">[ ]</span>
                        <span>Review problem compilation metrics</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-emerald-500/30 text-xs">
                [SYS.ERR // NO DIAGNOSTIC SESSIONS GENERATED]
              </div>
            )}
          </div>
        </div>
      </m.div>
    );
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="show" className="font-mono text-emerald-400 w-full">
      <div className="space-y-6">

        {currentProblems && currentProblems.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 border-b border-emerald-500/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex min-w-0 items-start gap-3 sm:items-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 animate-pulse">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black tracking-wider uppercase text-emerald-300">
                    CURATED CHALLENGE MODULES
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/50 mt-0.5">
                    {currentProblems.length} Target node{currentProblems.length === 1 ? "" : "s"} generated
                  </p>
                </div>
              </div>
            </div>

            <m.div
              className="grid gap-3"
              variants={listStagger}
              initial="hidden"
              animate="show"
            >
              {currentProblems.map((problem, index) => {
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
              })}
            </m.div>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3 text-emerald-500/40">
            <RefreshCw className="size-8 mx-auto opacity-20 animate-spin duration-3000" />
            <p className="text-[11px] font-bold uppercase tracking-wider">
              [ NO COMPILED CHALLENGE NODES FOUND ]
            </p>
          </div>
        )}

        <div className="flex justify-center pt-4 border-t border-emerald-500/10">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                onClick={onGenerateProblems}
                disabled={isPoolLoading}
                variant="outline"
                className="flex-1 h-12 rounded border border-emerald-500/35 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 disabled:opacity-50 transition-all font-mono"
              >
                {isPoolLoading ? (
                  <>
                    <RefreshCw className="size-4 mr-2 animate-spin" />
                    [ COMPILING_NODES... ]
                  </>
                ) : problems && problems.length > 0 ? (
                  <>
                    <RefreshCw className="size-4 mr-2" />
                    [ RECOMPILE_SET.SH ]
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    [ COMPILE_PROBLEMS.EXE ]
                  </>
                )}
              </Button>

              {problems && problems.length > 0 && (
                <Button
                  onClick={() => void onStartSession()}
                  className="flex-1 h-12 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all font-mono"
                >
                  <Play className="size-4 mr-2 fill-current" />
                  [ START_RUN.SH ]
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default ProblemsCard;

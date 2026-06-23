"use client";

import { m, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Play, Eye, EyeOff, CheckCircle2 } from "lucide-react";
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
}: ProblemsCardProps) => {
  const progressPercent = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  if (isTraining) {
    return (
      <m.div initial="hidden" animate="show" variants={fadeUp}>
        <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)]">
          <div className="relative px-6 py-5 sm:px-8 sm:py-6 border-b border-white/[0.04]">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] via-transparent to-emerald-500/[0.02]" />
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight">Problem Set</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {solvedCount} of {totalCount} completed
                </p>
              </div>
              <button
                onClick={onToggleTags}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
                  showTags
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]"
                    : "bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06]"
                )}
              >
                {showTags ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                {showTags ? "Tags On" : "Tags Off"}
              </button>
            </div>
          </div>

          <div className="px-6 sm:px-8 pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Progress</span>
              <span className="text-xs font-bold text-foreground tabular-nums">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <m.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              />
            </div>
          </div>

          <div className="p-6 sm:px-8 sm:pb-8 pt-6">
            {currentProblems && currentProblems.length > 0 ? (
              <>
                <m.div className="space-y-2.5" variants={listStagger} initial="hidden" animate="show">
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

                <div className="mt-6 pt-5 border-t border-white/[0.04]">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[11px] font-medium text-foreground/80 mb-3">Session Checklist</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("size-4 rounded-full border flex items-center justify-center", solvedCount > 0 ? "bg-emerald-500/20 border-emerald-500/30" : "border-white/10")}>
                          {solvedCount > 0 && <CheckCircle2 className="size-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60">Solve at least one problem</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className={cn("size-4 rounded-full border flex items-center justify-center", solvedCount === totalCount && totalCount > 0 ? "bg-emerald-500/20 border-emerald-500/30" : "border-white/10")}>
                          {solvedCount === totalCount && totalCount > 0 && <CheckCircle2 className="size-2.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] text-muted-foreground/60">Complete all problems</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="size-4 rounded-full border border-white/10" />
                        <span className="text-[10px] text-muted-foreground/60">Review solutions after session</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-muted-foreground">No problems available</p>
              </div>
            )}
          </div>
        </div>
      </m.div>
    );
  }

  return (
    <m.div variants={fadeUp} initial="hidden" animate="show">
      <Card className="relative overflow-hidden border-border/60 shadow-2xl bg-card/40 backdrop-blur-xl w-full">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        </div>

        <CardContent className="p-4 sm:p-8 space-y-6 overflow-x-hidden">
          {currentProblems && currentProblems.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pb-8">
                <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-inner sm:h-12 sm:w-12">
                    <Sparkles className="size-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0 space-y-2 sm:space-y-1">
                    <h3 className="text-xl font-black leading-tight tracking-tight text-foreground sm:text-2xl">
                      Curated Problems
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {currentProblems.length} Challenge{currentProblems.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </div>

              <m.div
                className="grid gap-4"
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
            <div className="py-12 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground border border-border/40">
                <RefreshCw className="size-8 opacity-20" />
              </div>
              <p className="text-muted-foreground font-medium">
                No problems generated yet. Use the controls above to start.
              </p>
            </div>
          )}

          <div className="flex justify-center pt-4 border-t border-border/40">
            <div className="w-full max-w-2xl">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={onGenerateProblems}
                  disabled={isPoolLoading}
                  className="flex-1 h-14 text-base font-black uppercase tracking-widest bg-background border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 transition-all shadow-xl hover:shadow-primary/5 disabled:opacity-60 disabled:cursor-wait"
                >
                  {isPoolLoading ? (
                    <>
                      <RefreshCw className="size-5 mr-3 animate-spin" />
                      Loading Problems...
                    </>
                  ) : problems && problems.length > 0 ? (
                    <>
                      <RefreshCw className="size-5 mr-3" />
                      Regenerate Set
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-5 mr-3" />
                      Generate Problems
                    </>
                  )}
                </Button>

                {problems && problems.length > 0 && (
                  <Button
                    onClick={() => void onStartSession()}
                    className="flex-1 h-14 text-base font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
                  >
                    <Play className="size-5 mr-3 fill-current" />
                    Start Session
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
};

export default ProblemsCard;

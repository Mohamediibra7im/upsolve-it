"use client";

import { m, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Play } from "lucide-react";
import { TrainingProblem } from "@/types/TrainingProblem";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import ProblemRow from "./ProblemRow";
import { speedStatusLabel } from "@/services/training/speedStatus";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
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
  /** Rating/tag visibility for rows */
  showRatings: boolean;
  hideContestDetails?: boolean;
  onProblemOpen?: (problem: TrainingProblem) => void;
  isPoolLoading?: boolean;
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
}: ProblemsCardProps) => {
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
                    {isTraining && (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary sm:hidden">
                          {solvedCount} / {totalCount} Solved
                        </p>
                        <div className="hidden min-w-0 items-center gap-3 sm:flex">
                          <div className="h-2 min-h-[8px] min-w-[6rem] flex-1 rounded-full border border-border/20 bg-muted/40 overflow-hidden">
                            <m.div
                              className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                              initial={{ width: 0 }}
                              animate={{
                                width: `${(solvedCount / totalCount) * 100}%`,
                              }}
                              transition={{ duration: 1, ease: "easeOut" }}
                            />
                          </div>
                          <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-primary">
                            {solvedCount} / {totalCount} Solved
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full shrink-0 sm:w-auto sm:self-center">
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-sm sm:px-5">
                    {currentProblems.length} Challenge
                    {currentProblems.length === 1 ? "" : "s"}
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
                    problem.speedStatus &&
                    problem.speedStatus !== "unsolved"
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

          {!isTraining && (
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
                        Loading Problems…
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
          )}
        </CardContent>
      </Card>
    </m.div>
  );
};

export default ProblemsCard;

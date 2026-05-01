"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, Play } from "lucide-react";
import { TrainingProblem } from "@/types/TrainingProblem";
import { ProblemTag } from "@/types/Codeforces";
import { SubmissionStatus } from "@/utils/codeforces/getTrainingSubmissionStatus";
import ProblemRow from "./ProblemRow";

type CustomRatings = { P1: number; P2: number; P3: number; P4: number };

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
  generateProblems: (
    tags: ProblemTag[],
    lb: number | null,
    ub: number | null,
    ratings: CustomRatings,
  ) => void;
  startTraining: (ratings: CustomRatings) => void;
  selectedTags: ProblemTag[];
  lb: number | null;
  ub: number | null;
  customRatings: CustomRatings;
  problems: TrainingProblem[] | null;
  showRatings: boolean;
}

const ProblemsCard = ({
  currentProblems,
  isTraining,
  solvedCount,
  totalCount,
  submissionStatuses,
  startTime,
  generateProblems,
  startTraining,
  selectedTags,
  lb,
  ub,
  customRatings,
  problems,
  showRatings,
}: ProblemsCardProps) => {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show">
      <Card className="relative overflow-hidden border-border/60 shadow-2xl bg-card/40 backdrop-blur-xl w-full">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        </div>
        
        <CardContent className="p-6 sm:p-8 space-y-6">
          {currentProblems && currentProblems.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 pb-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">
                      Curated Problems
                    </h3>
                    {isTraining && (
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-32 bg-muted/40 rounded-full overflow-hidden border border-border/20">
                          <motion.div 
                            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(solvedCount / totalCount) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {solvedCount} / {totalCount} Solved
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-5 py-2 bg-primary/5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/10 backdrop-blur-sm">
                    {currentProblems.length} Challenge{currentProblems.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <motion.div
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

                  return (
                    <motion.div
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
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto text-muted-foreground border border-border/40">
                <RefreshCw className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-muted-foreground font-medium">No problems generated yet. Use the controls above to start.</p>
            </div>
          )}

          {!isTraining && (
            <div className="flex justify-center pt-4 border-t border-border/40">
              <div className="w-full max-w-2xl">
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() =>
                      generateProblems(selectedTags, lb, ub, customRatings)
                    }
                    className="flex-1 h-14 text-base font-black uppercase tracking-widest bg-background border-2 border-primary/20 hover:border-primary text-primary hover:bg-primary/5 transition-all shadow-xl hover:shadow-primary/5"
                  >
                    {problems && problems.length > 0 ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-3" />
                        Regenerate Set
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-3" />
                        Generate Problems
                      </>
                    )}
                  </Button>
                  
                  {problems && problems.length > 0 && (
                    <Button
                      onClick={() => startTraining(customRatings)}
                      className="flex-1 h-14 text-base font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1"
                    >
                      <Play className="h-5 w-5 mr-3 fill-current" />
                      Start Session
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProblemsCard;








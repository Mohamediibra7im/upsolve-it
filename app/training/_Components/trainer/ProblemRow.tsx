"use client";

import Link from "next/link";
import { TrainingProblem } from "@/types/TrainingProblem";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Lock, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { SubmissionStatus } from "@/utils/codeforces/getTrainingSubmissionStatus";
import { motion } from "framer-motion";

const ProblemRow = ({
  problem,
  index,
  isTraining,
  startTime,
  submissionStatus,
  showRatings,
}: {
  problem: TrainingProblem;
  index: number;
  isTraining: boolean;
  startTime: number | null;
  submissionStatus?: SubmissionStatus;
  showRatings: boolean;
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
  const problemLabels = ["A", "B", "C", "D"];

  const getSolvedStatus = () => {
    if (!isTraining) return "";

    if (submissionStatus) {
      switch (submissionStatus.status) {
        case "AC":
          return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {problem.solvedTime && startTime ? `${Math.floor((problem.solvedTime - startTime) / 60000)}m` : "Solved"}
              </span>
            </div>
          );
        case "WA":
          return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <XCircle className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Incomplete</span>
            </div>
          );
        case "TESTING":
          return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest">Verifying</span>
            </div>
          );
      }
    }

    if (problem.solvedTime && startTime) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {Math.floor((problem.solvedTime - startTime) / 60000)}m
          </span>
        </div>
      );
    }

    return null;
  };

  const content = (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl border py-3.5 px-5 transition-all duration-500",
        isPreContestPeriod
          ? "border-border/40 bg-muted/5 opacity-80"
          : "border-border/60 bg-background/40 hover:border-primary/40 hover:bg-background/80 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Index Label */}
        <div
          className={cn(
            "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-lg font-black shadow-inner transition-all duration-500",
            isPreContestPeriod
              ? "bg-muted/20 text-muted-foreground/30"
              : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6"
          )}
        >
          {problemLabels[index] || problem.index}
        </div>

        {/* Info Area */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              {(isPreContestPeriod || (!isTraining && !showRatings)) ? (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="h-4 w-28 bg-muted/30 rounded-lg animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">
                      Encrypted
                    </div>
                  </div>
                </div>
              ) : (
                <h4 className="truncate text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {problem.name}
                </h4>
              )}
            </div>
            {getSolvedStatus()}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Rating
              </div>
              <span className={cn(
                "text-xs font-bold text-foreground tabular-nums transition-all duration-300",
                (!isTraining && !showRatings) && "blur-sm opacity-40 select-none"
              )}>
                {isPreContestPeriod ? "????" : problem.rating}
              </span>
            </div>
            
            <div className="h-0.5 w-0.5 rounded-full bg-border" />
            
            <div className="flex items-center gap-1.5">
              <div className="px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/40 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Round
              </div>
              <span className={cn(
                "text-xs font-bold text-foreground tabular-nums transition-all duration-300",
                (!isTraining && !showRatings) && "blur-sm opacity-40 select-none"
              )}>
                {isPreContestPeriod ? "???" : problem.contestId}
              </span>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <div className="flex flex-shrink-0 items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {!isPreContestPeriod && (showRatings || isTraining) &&
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
              "h-10 w-10 flex items-center justify-center rounded-full transition-all duration-500 shadow-sm",
              isPreContestPeriod
                ? "bg-muted/20 text-muted-foreground/40"
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105"
            )}
          >
            {isPreContestPeriod ? (
              <Lock className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
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
    <Link href={problem.url} target="_blank" className="block no-underline">
      {content}
    </Link>
  );
};

export default ProblemRow;








"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import { useState, useEffect, useMemo } from "react";
import { SubmissionStatus } from "@/utils/codeforces/getTrainingSubmissionStatus";

// Sub-components
import StopTrainingDialog from "./trainer/StopTrainingDialog";
import FinishTrainingDialog from "./trainer/FinishTrainingDialog";
import ProblemsCard from "./trainer/ProblemsCard";
import TrainingControls from "./trainer/TrainingControls";
import { cn } from "@/lib/utils";

const Trainer = ({
  isTraining,
  training,
  problems,
  generateProblems,
  startTraining,
  stopTraining,
  refreshProblemStatus,
  finishTraining,
  selectedTags,
  lb,
  ub,
  customRatings,
  submissionStatuses,
  isRefreshing,
  showRatings,
}: {
  isTraining: boolean;
  training: Training | null;
  problems: TrainingProblem[] | null;
  generateProblems: (
    tags: ProblemTag[],
    lb: number | null,
    ub: number | null,
    customRatings: { P1: number; P2: number; P3: number; P4: number },
  ) => void;
  startTraining: (customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => void;
  stopTraining: () => void;
  refreshProblemStatus: () => void;
  finishTraining: () => void;
  selectedTags: ProblemTag[];
  lb: number | null;
  ub: number | null;
  customRatings: { P1: number; P2: number; P3: number; P4: number };
  submissionStatuses: SubmissionStatus[];
  isRefreshing: boolean;
  showRatings: boolean;
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isTraining || !training?.startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining, training?.startTime]);

  const isPreContestPeriod = useMemo(() => {
    return isTraining && !!training?.startTime && currentTime < training.startTime;
  }, [isTraining, training?.startTime, currentTime]);

  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);

  const confirmFinish = () => {
    setIsFinishDialogOpen(false);
    finishTraining();
  };

  const confirmStop = () => {
    setIsStopDialogOpen(false);
    stopTraining();
  };

  const currentProblems = isTraining && training?.problems ? training.problems : problems;

  const solvedCount = useMemo(() => {
    if (!isTraining || !currentProblems?.length) return 0;
    const solvedByStatus = new Set(
      submissionStatuses.filter((s) => s.status === "AC").map((s) => s.problemId),
    );
    return currentProblems.filter((p) => {
      const pid = `${p.contestId}_${p.index}`;
      return Boolean(p.solvedTime) || solvedByStatus.has(pid);
    }).length;
  }, [isTraining, currentProblems, submissionStatuses]);

  const totalCount = currentProblems?.length ?? 0;

  return (
    <div className={isTraining ? "pb-28 lg:pb-0" : undefined}>
      <StopTrainingDialog
        isOpen={isStopDialogOpen}
        onCancel={() => setIsStopDialogOpen(false)}
        onConfirm={confirmStop}
      />

      <FinishTrainingDialog
        isOpen={isFinishDialogOpen}
        onCancel={() => setIsFinishDialogOpen(false)}
        onConfirm={confirmFinish}
      />

      <div className={cn(
        "grid gap-4 lg:gap-6",
        isTraining ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1"
      )}>
        <ProblemsCard
          currentProblems={currentProblems}
          isTraining={isTraining}
          solvedCount={solvedCount}
          totalCount={totalCount}
          submissionStatuses={submissionStatuses}
          startTime={training?.startTime ?? null}
          generateProblems={generateProblems}
          startTraining={startTraining}
          selectedTags={selectedTags}
          lb={lb}
          ub={ub}
          customRatings={customRatings}
          problems={problems}
          showRatings={showRatings}
        />

        <TrainingControls
          training={training}
          isTraining={isTraining}
          isPreContestPeriod={isPreContestPeriod}
          solvedCount={solvedCount}
          totalCount={totalCount}
          isRefreshing={isRefreshing}
          refreshProblemStatus={refreshProblemStatus}
          onFinishTraining={() => setIsFinishDialogOpen(true)}
          onStopTraining={() => setIsStopDialogOpen(true)}
        />
      </div>
    </div>
  );
};

export default Trainer;








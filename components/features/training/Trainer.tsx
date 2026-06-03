"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { useState, useEffect, useMemo } from "react";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";

// Sub-components
import StopTrainingDialog from "./trainer/StopTrainingDialog";
import FinishTrainingDialog from "./trainer/FinishTrainingDialog";
import ProblemsCard from "./trainer/ProblemsCard";
import TrainingControls from "./trainer/TrainingControls";
import { cn } from "@/lib/utils";

type TrainerStatus = "idle" | "training" | "refreshing";

interface TrainerDisplayOptions {
  showRatings: boolean;
  hideContestDetails?: boolean;
}

interface TrainerProps {
  status: TrainerStatus;
  training: Training | null;
  problems: TrainingProblem[] | null;
  onGenerateProblems: () => void;
  onStartSession: () => void;
  stopTraining: () => void;
  refreshProblemStatus: () => void;
  finishTraining: () => void;
  submissionStatuses: SubmissionStatus[];
  display: TrainerDisplayOptions;
  onProblemOpen?: (problem: TrainingProblem) => void;
}

const Trainer = ({
  status,
  training,
  problems,
  onGenerateProblems,
  onStartSession,
  stopTraining,
  refreshProblemStatus,
  finishTraining,
  submissionStatuses,
  display,
  onProblemOpen,
}: TrainerProps) => {
  const isTraining = status === "training" || status === "refreshing";
  const isRefreshing = status === "refreshing";
  const { showRatings, hideContestDetails } = display;
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!isTraining || !training?.startTime) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isTraining, training?.startTime]);

  const isPreContestPeriod = useMemo(() => {
    return (
      isTraining && !!training?.startTime && currentTime < training.startTime
    );
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

  const currentProblems =
    isTraining && training?.problems ? training.problems : problems;

  const solvedCount = useMemo(() => {
    if (!isTraining || !currentProblems?.length) return 0;
    const solvedByStatus = new Set(
      submissionStatuses
        .filter((s) => s.status === "AC")
        .map((s) => s.problemId),
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

      <div
        className={cn(
          "grid gap-4 lg:gap-6",
          isTraining ? "lg:grid-cols-[minmax(0,1fr)_360px]" : "grid-cols-1",
        )}
      >
        <ProblemsCard
          currentProblems={currentProblems}
          isTraining={isTraining}
          solvedCount={solvedCount}
          totalCount={totalCount}
          submissionStatuses={submissionStatuses}
          startTime={training?.startTime ?? null}
          onGenerateProblems={onGenerateProblems}
          onStartSession={onStartSession}
          problems={problems}
          showRatings={showRatings}
          hideContestDetails={hideContestDetails}
          onProblemOpen={onProblemOpen}
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

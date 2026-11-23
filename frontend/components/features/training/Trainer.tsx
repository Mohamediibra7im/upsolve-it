"use client";

import { useState, useEffect, useMemo } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import SessionDialog from "./trainer/SessionDialog";
import ProblemRow from "./trainer/ProblemRow";
import TrainingControls from "./trainer/TrainingControls";
import Workspace from "@/components/features/solve/Workspace";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";

interface TrainerProps {
  training: Training;
  isRefreshing: boolean;
  submissionStatuses: SubmissionStatus[];
  refreshProblemStatus: () => void;
  finishTraining: () => void;
  stopTraining: () => void;
  onProblemOpen: (problem: TrainingProblem) => void;
  onExtendEndTime: (minutes: number) => void;
}

/** A live session: the clock band, the progress line, and the problems. */
const Trainer = ({
  training,
  isRefreshing,
  submissionStatuses,
  refreshProblemStatus,
  finishTraining,
  stopTraining,
  onProblemOpen,
  onExtendEndTime,
}: TrainerProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isPreContestPeriod = currentTime < training.startTime;
  const hideContestDetails = training.trainingMode === "contest";
  const { problems } = training;

  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);

  const solvedCount = useMemo(() => {
    const solvedByStatus = new Set(
      submissionStatuses
        .filter((s) => s.status === "AC")
        .map((s) => s.problemId),
    );
    return problems.filter(
      (p) =>
        Boolean(p.solvedTime) ||
        solvedByStatus.has(`${p.contestId}_${p.index}`),
    ).length;
  }, [problems, submissionStatuses]);

  return (
    <>
      <SessionDialog
        isOpen={isFinishDialogOpen}
        title="Ready to wrap up?"
        confirmLabel="Finish session"
        onCancel={() => setIsFinishDialogOpen(false)}
        onConfirm={() => {
          setIsFinishDialogOpen(false);
          finishTraining();
        }}
      >
        We’ll save your session and take you to your results. Unsolved problems
        go to your upsolve queue, so you can return to them later.
      </SessionDialog>
      <SessionDialog
        isOpen={isStopDialogOpen}
        title="Discard this session?"
        confirmLabel="Discard session"
        destructive
        onCancel={() => setIsStopDialogOpen(false)}
        onConfirm={() => {
          setIsStopDialogOpen(false);
          stopTraining();
        }}
      >
        This session and its progress will be discarded. This can’t be undone.
        To save your results, choose Finish session instead.
      </SessionDialog>

      {isPreContestPeriod || problems.length === 0 ? (
        // Before the start: the countdown, and the problems behind their locks.
        <section aria-label="Your session" className="u-panel">
          <TrainingControls
            training={training}
            isPreContestPeriod={isPreContestPeriod}
            solvedCount={solvedCount}
            totalCount={problems.length}
            isRefreshing={isRefreshing}
            refreshProblemStatus={refreshProblemStatus}
            onFinishTraining={() => setIsFinishDialogOpen(true)}
            onStopTraining={() => setIsStopDialogOpen(true)}
            onExtendEndTime={onExtendEndTime}
          />
          {problems.length === 0 && (
            <p className="u-panel__body t-muted">
              No problems are available in this session.
            </p>
          )}
          {problems.map((problem, index) => (
            <ProblemRow
              key={`${problem.contestId}-${problem.index}-${index}`}
              problem={problem}
              index={index}
              startTime={training.startTime}
              locked
              hideContestDetails={hideContestDetails}
            />
          ))}
        </section>
      ) : (
        // Once the clock runs the whole page is the workspace, edge to edge:
        // the session's clock and actions sit in its bar.
        <div className="sw-page">
          <Workspace
            title={formatTrainingModeLabel(
              normalizeTrainingMode(training.trainingMode),
            )}
            problems={problems}
            statuses={submissionStatuses}
            hideDetails={hideContestDetails}
            onProblemOpen={onProblemOpen}
            session={
              <TrainingControls
                compact
                training={training}
                isPreContestPeriod={false}
                solvedCount={solvedCount}
                totalCount={problems.length}
                isRefreshing={isRefreshing}
                refreshProblemStatus={refreshProblemStatus}
                onFinishTraining={() => setIsFinishDialogOpen(true)}
                onStopTraining={() => setIsStopDialogOpen(true)}
                onExtendEndTime={onExtendEndTime}
              />
            }
            notice={
              training.weaknessFallback && (
                <p className="t-sm t-muted flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
                  <Badge variant="pending">
                    <Info aria-hidden="true" />
                    Ladder problems
                  </Badge>
                  We’re still learning your strengths. This session uses ladder
                  problems until there’s enough history to target your weak
                  topics.
                </p>
              )
            }
          />
        </div>
      )}
    </>
  );
};

export default Trainer;

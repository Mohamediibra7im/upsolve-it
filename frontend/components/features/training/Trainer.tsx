"use client";

import { useState, useEffect, useMemo } from "react";
import { Eye, EyeOff, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bar } from "@/components/ui/kit";
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
  const [showTags, setShowTags] = useState(false);

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
        <Bar
          value={problems.length ? (solvedCount / problems.length) * 100 : 0}
          label="Problems solved"
          className="h-1.5 rounded-none"
        />
        {training.weaknessFallback && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-5 py-3 t-sm t-muted">
            <Badge variant="pending">
              <Info aria-hidden="true" />
              Ladder problems
            </Badge>
            We’re still learning your strengths. This session uses ladder
            problems until there’s enough history to target your weak topics.
          </p>
        )}
        {problems.length === 0 && (
          <p className="u-panel__body t-muted">
            No problems are available in this session.
          </p>
        )}
        {/* Before the start the problems wait behind locks; once the clock
            runs they open in the workspace below instead of a list of links. */}
        {isPreContestPeriod &&
          problems.map((problem, index) => (
            <ProblemRow
              key={`${problem.contestId}-${problem.index}-${index}`}
              problem={problem}
              index={index}
              startTime={training.startTime}
              locked={isPreContestPeriod}
              submissionStatus={submissionStatuses.find(
                (s) => s.problemId === `${problem.contestId}_${problem.index}`,
              )}
              hideContestDetails={hideContestDetails}
              onProblemOpen={onProblemOpen}
              opened={
                training.serverSessionId
                  ? Boolean(problem.startedAt)
                  : undefined
              }
              showTags={showTags}
            />
          ))}
        <div className="u-panel__foot border-t-0">
          <span>
            {problems.some((p) => p.judge === "atcoder")
              ? "Submitted on the judge? Refresh status to see your result. An AtCoder result can take a few minutes to show."
              : "Submitted on Codeforces? Refresh status to see your result."}
          </span>
          {!hideContestDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTags(!showTags)}
            >
              {showTags ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
              {showTags ? "Hide topics" : "Show topics"}
            </Button>
          )}
        </div>
      </section>

      {!isPreContestPeriod && problems.length > 0 && (
        <div className="mt-6">
          <Workspace
            title={`${formatTrainingModeLabel(normalizeTrainingMode(training.trainingMode))} session`}
            problems={problems}
            statuses={submissionStatuses}
            hideDetails={hideContestDetails}
            showTags={showTags}
            onProblemOpen={onProblemOpen}
          />
        </div>
      )}
    </>
  );
};

export default Trainer;

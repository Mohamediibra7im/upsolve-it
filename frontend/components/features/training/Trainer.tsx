"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { SubmissionStatus } from "@/services/codeforces/getTrainingSubmissionStatus";
import SessionDialog from "./trainer/SessionDialog";
import TrainingControls from "./trainer/TrainingControls";
import RoomLobby from "./trainer/RoomLobby";
import RoomStandings from "./trainer/RoomStandings";
import { reportRoomProgress, useRoom } from "@/hooks/room/useRoom";
import { useUser } from "@/hooks/auth";
import { useToast } from "@/components/providers/Toast";
import { breakLeftMs } from "@/services/training/breaks";
import "./trainer/room.css";
import Workspace from "@/components/features/solve/Workspace";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";

interface TrainerProps {
  training: Training;
  isRefreshing: boolean;
  submissionStatuses: SubmissionStatus[];
  /** Resolves to whether the verdicts could be read. */
  refreshProblemStatus: () => Promise<boolean>;
  finishTraining: () => void;
  stopTraining: () => void;
  onProblemOpen: (problem: TrainingProblem) => void;
  onStartBreak: (minutes: number) => void;
  onEndBreak: () => void;
  /** When the verdicts were last read from the judges. */
  lastCheckedAt?: number | null;
  /** The session is being saved: the room closes over the workspace. */
  isFinishing?: boolean;
  /** Saving failed. Shown inside the room, which covers the rest of the page. */
  finishError?: string | null;
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
  onStartBreak,
  onEndBreak,
  lastCheckedAt,
  isFinishing = false,
  finishError = null,
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

  // The room. Its doors open when the countdown ends: the lobby stays one
  // second longer, rising like a curtain off the workspace behind it.
  const modeName = formatTrainingModeLabel(
    normalizeTrainingMode(training.trainingMode),
  );
  const wasWaiting = useRef(isPreContestPeriod);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);
  // a failed save can be put aside to keep working; the next attempt shows again
  const [isErrorAside, setIsErrorAside] = useState(false);
  useEffect(() => {
    if (isFinishing) setIsErrorAside(false);
  }, [isFinishing]);
  const isClosing = isFinishing || (Boolean(finishError) && !isErrorAside);
  useEffect(() => {
    if (isPreContestPeriod || !wasWaiting.current) return;
    wasWaiting.current = false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setIsLeavingLobby(true);
    const timer = setTimeout(() => setIsLeavingLobby(false), 950);
    return () => clearTimeout(timer);
  }, [isPreContestPeriod]);
  const left = Math.max(0, training.endTime - currentTime);
  const clock = [left / 3_600_000, (left / 60_000) % 60, (left / 1000) % 60]
    .map((n) => Math.floor(n).toString().padStart(2, "0"))
    .join(":");

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

  const { toast } = useToast();
  const refreshByHand = async () => {
    if (await refreshProblemStatus()) return;
    toast({
      title: "Your results could not be read",
      description:
        "The judge did not answer. Your session is not affected; try again in a moment.",
      variant: "warning",
    });
  };
  const breakLeft = breakLeftMs(training, currentTime);
  const onBreak = breakLeft > 0 && !isPreContestPeriod;

  // A shared room: everyone in it, re-read every few seconds, and this
  // person's own progress sent to it whenever it changes.
  const { user } = useUser();
  const { room } = useRoom(training.roomCode, 5000);
  const problemIds = useMemo(
    () => problems.map((p) => p.problemId ?? `${p.contestId}_${p.index}`),
    [problems],
  );
  const progress = useMemo(() => {
    const status = new Map(submissionStatuses.map((s) => [s.problemId, s]));
    const solved = problemIds.filter(
      (id, i) =>
        Boolean(problems[i].solvedTime) || status.get(id)?.status === "AC",
    );
    const tried = problemIds.filter((id) => {
      const s = status.get(id);
      return s?.status === "WA" || s?.status === "TESTING";
    });
    return { solved, tried, key: `${solved.join()}|${tried.join()}` };
  }, [problems, problemIds, submissionStatuses]);
  const { roomCode } = training;
  useEffect(() => {
    if (!roomCode || isPreContestPeriod) return;
    void reportRoomProgress(roomCode, progress.solved, progress.tried);
    // progress.key stands for the two lists
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode, isPreContestPeriod, progress.key]);
  const others = room && room.members.length > 1 ? room.members : null;

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

      {problems.length === 0 ? (
        <section aria-label="Your session" className="u-panel">
          <TrainingControls
            training={training}
            isPreContestPeriod={isPreContestPeriod}
            solvedCount={solvedCount}
            totalCount={problems.length}
            isRefreshing={isRefreshing}
            refreshProblemStatus={refreshByHand}
            onFinishTraining={() => setIsFinishDialogOpen(true)}
            onStopTraining={() => setIsStopDialogOpen(true)}
            onStartBreak={onStartBreak}
            onEndBreak={onEndBreak}
            lastCheckedAt={lastCheckedAt}
          />
          <p className="u-panel__body t-muted">
            No problems are available in this session.
          </p>
        </section>
      ) : (
        // A session is a room: it covers the site's bar and footer. Before
        // the start, the lobby; once the clock runs, the workspace.
        <div className="room">
          {!isPreContestPeriod && (
            <div className="room__in" inert={onBreak}>
              <div className="room__water" aria-hidden="true">
                {clock}
              </div>
              {others && (
                <RoomStandings
                  row
                  members={others}
                  problemIds={problemIds}
                  meId={user?._id}
                />
              )}
              <div className="sw-page">
                <Workspace
                  room
                  title={modeName}
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
                      refreshProblemStatus={refreshByHand}
                      onFinishTraining={() => setIsFinishDialogOpen(true)}
                      onStopTraining={() => setIsStopDialogOpen(true)}
                      onStartBreak={onStartBreak}
                      onEndBreak={onEndBreak}
                      lastCheckedAt={lastCheckedAt}
                    />
                  }
                  notice={
                    training.weaknessFallback && (
                      <p className="t-sm t-muted flex flex-wrap items-center gap-x-3 gap-y-2 px-1">
                        <Badge variant="pending">
                          <Info aria-hidden="true" />
                          Ladder problems
                        </Badge>
                        We’re still learning your strengths. This session uses
                        ladder problems until there’s enough history to target
                        your weak topics.
                      </p>
                    )
                  }
                />
              </div>
            </div>
          )}
          {onBreak && (
            <div className="room__closed" role="status">
              <div className="lobby__beam" aria-hidden="true" />
              <span className="t-eyebrow relative">On a break</span>
              <h2 className="t-num">
                {Math.floor(breakLeft / 60000)
                  .toString()
                  .padStart(2, "0")}
                :
                {Math.floor((breakLeft % 60000) / 1000)
                  .toString()
                  .padStart(2, "0")}
              </h2>
              <p className="t-muted max-w-md">
                The clock is paused and the problems are covered. Come back
                early and the time you did not use is returned.
              </p>
              <div className="relative">
                <Button onClick={onEndBreak}>Resume now</Button>
              </div>
            </div>
          )}
          {(isPreContestPeriod || isLeavingLobby) && (
            <RoomLobby
              name={modeName}
              msLeft={training.startTime - currentTime}
              people={others ?? undefined}
              problemCount={problems.length}
              minutes={Math.round(
                (training.endTime - training.startTime) / 60000,
              )}
              ratingsHidden={hideContestDetails}
              leaving={isLeavingLobby}
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStopDialogOpen(true)}
                >
                  <X aria-hidden="true" />
                  {others ? "Leave" : "Cancel session"}
                </Button>
              }
            />
          )}
          {isClosing && (
            <div
              className="room__closed"
              role={isFinishing ? "status" : "alert"}
            >
              <div className="lobby__beam" aria-hidden="true" />
              <span className="t-eyebrow relative">
                {modeName} room · {isFinishing ? "closing" : "not saved"}
              </span>
              <h2>
                You solved{" "}
                <em>
                  {solvedCount} of {problems.length}.
                </em>
              </h2>
              {others && (
                <RoomStandings
                  members={others}
                  problemIds={problemIds}
                  meId={user?._id}
                />
              )}
              {isFinishing ? (
                <p className="t-muted">
                  Saving your session and opening the review…
                </p>
              ) : (
                <>
                  <p className="text-failed max-w-md">
                    {finishError} Your session is still saved on this device.
                  </p>
                  <div className="relative flex flex-wrap justify-center gap-3">
                    <Button onClick={finishTraining}>Save session again</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsErrorAside(true)}
                    >
                      Back to the room
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Trainer;

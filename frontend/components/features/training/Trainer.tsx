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
import {
  isSharedRoom,
  voteBlocked,
  voteState,
} from "@/services/training/roomVote";
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
  const { room, vote, leave, refresh } = useRoom(training.roomCode, 5000);
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

  // With other people still in the room nobody ends it alone: finishing is
  // a vote everyone has to agree to, and the way out for one person is to
  // leave, which saves their session and lets the room go on.
  const shared = isSharedRoom(roomCode, room, user?._id);
  const ballot = voteState(room, user?._id, currentTime);
  const tellRoomILeft = () => {
    if (roomCode && room?.status === "running")
      void leave().catch(() => undefined);
  };
  // one answer at a time: a second click must not send a second vote
  const [isVoting, setIsVoting] = useState(false);
  const castVote = async (agree: boolean) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await vote(agree);
    } catch (e) {
      // A vote that reaches the server after the room has ended is refused,
      // and nothing is wrong: the room is read again and closes by itself.
      // Only a refusal in a room that still runs is worth telling.
      const latest = await refresh().catch(() => undefined);
      if (latest?.status === "running")
        toast({
          title: "Your vote did not go through",
          description:
            e instanceof Error ? e.message : "Try again in a moment.",
          variant: "warning",
        });
    } finally {
      setIsVoting(false);
    }
  };
  const leaveRoom = async () => {
    await leave().catch(() => undefined);
    finishTraining();
  };

  // a vote that goes away while the room still runs did not pass
  const hasVote = Boolean(room?.endVote);
  const roomStatus = room?.status;
  const hadVote = useRef(false);
  useEffect(() => {
    if (hadVote.current && !hasVote && roomStatus === "running")
      toast({
        title: "The vote to end did not pass",
        description: "The room goes on.",
      });
    hadVote.current = hasVote;
  }, [hasVote, roomStatus, toast]);

  // The room ended for everyone (a vote passed, all is solved, or its time is
  // up): this person's session is saved with it.
  const finish = useRef(finishTraining);
  useEffect(() => {
    finish.current = finishTraining;
  });
  useEffect(() => {
    if (roomStatus === "ended") finish.current();
  }, [roomStatus]);

  return (
    <>
      {shared ? (
        <SessionDialog
          isOpen={isFinishDialogOpen}
          title="End the room for everyone?"
          confirmLabel="Call the vote"
          onCancel={() => setIsFinishDialogOpen(false)}
          onConfirm={() => {
            setIsFinishDialogOpen(false);
            void castVote(true);
          }}
        >
          Everyone in the room gets 60 seconds to agree. If all agree, the room
          ends and every session is saved. If not, it goes on, and you can ask
          again in 5 minutes.
        </SessionDialog>
      ) : (
        <SessionDialog
          isOpen={isFinishDialogOpen}
          title="Ready to wrap up?"
          confirmLabel="Finish session"
          onCancel={() => setIsFinishDialogOpen(false)}
          onConfirm={() => {
            setIsFinishDialogOpen(false);
            tellRoomILeft();
            finishTraining();
          }}
        >
          We’ll save your session and take you to your results. Unsolved
          problems go to your upsolve queue, so you can return to them later.
        </SessionDialog>
      )}
      {shared && !isPreContestPeriod ? (
        <SessionDialog
          isOpen={isStopDialogOpen}
          title="Leave the room?"
          confirmLabel="Leave room"
          onCancel={() => setIsStopDialogOpen(false)}
          onConfirm={() => {
            setIsStopDialogOpen(false);
            void leaveRoom();
          }}
        >
          Your session is saved as it stands and you go to your results. The
          room goes on for the others, and you can’t come back to it.
        </SessionDialog>
      ) : (
        <SessionDialog
          isOpen={isStopDialogOpen}
          title="Discard this session?"
          confirmLabel="Discard session"
          destructive
          onCancel={() => setIsStopDialogOpen(false)}
          onConfirm={() => {
            setIsStopDialogOpen(false);
            tellRoomILeft();
            stopTraining();
          }}
        >
          This session and its progress will be discarded. This can’t be undone.
          To save your results, choose Finish session instead.
        </SessionDialog>
      )}

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
              {ballot && (
                <div className="room-vote">
                  <span aria-hidden="true">{ballot.secondsLeft}s</span>
                  <p role="status">
                    <b>
                      {ballot.calledByMe
                        ? "You asked to end the room."
                        : `${ballot.byName} wants to end the room.`}
                    </b>{" "}
                    <span className="t-muted">
                      <span className="t-num">{ballot.agreed}</span> of{" "}
                      <span className="t-num">{ballot.needed}</span> agreed.
                      Everyone has to agree.
                    </span>
                  </p>
                  {ballot.iAgreed ? (
                    <span className="t-sm t-muted">
                      Waiting for the others…
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        disabled={isVoting}
                        onClick={() => void castVote(true)}
                      >
                        Agree
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isVoting}
                        onClick={() => void castVote(false)}
                      >
                        Keep going
                      </Button>
                    </>
                  )}
                </div>
              )}
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
                      shared={
                        shared
                          ? {
                              voteBlocked: ballot
                                ? "A vote is already running."
                                : isVoting
                                  ? "Calling the vote…"
                                  : voteBlocked(room, currentTime),
                            }
                          : undefined
                      }
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
                  {room?.endedBy === "vote"
                    ? "The room voted to end. "
                    : room?.endedBy === "solved"
                      ? "Everyone solved everything. "
                      : ""}
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

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Link2, LogOut, Play } from "lucide-react";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/kit";
import { useToast } from "@/components/providers/Toast";
import RoomLobby from "@/components/features/training/trainer/RoomLobby";
import "@/components/features/training/trainer/room.css";
import { useUser } from "@/hooks/auth";
import { useRoom } from "@/hooks/room/useRoom";
import { beginRoomTraining } from "@/services/training/roomTraining";
import {
  formatTrainingModeLabel,
  normalizeTrainingMode,
} from "@/services/training/trainingModeLabel";

const messageOf = (e: unknown) =>
  e instanceof Error ? e.message : "Try again in a moment.";

/**
 * A shared room before its start: everyone who followed the link stands on
 * the stage, and the person who opened the room gives the start. From then on
 * it is each person's own session at /training, on the room's clock.
 */
export default function RoomPage({ code }: { code: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const valid = /^[a-z0-9]{8}$/.test(code);
  const { room, error, join, start, leave } = useRoom(
    valid ? code : null,
    2000,
  );
  const [refusal, setRefusal] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const asked = useRef(false);
  const begun = useRef(false);

  // Following the link is joining: no extra button to press.
  const shouldJoin = !!room && !room.isMember && room.status === "lobby";
  useEffect(() => {
    if (!shouldJoin || asked.current) return;
    asked.current = true;
    join().catch((e) => setRefusal(messageOf(e)));
    // join is recreated on every render; shouldJoin is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldJoin]);

  // The start was given: the room becomes this person's session.
  const shouldBegin =
    !!room?.isMember && room.status === "running" && !!room.problems;
  useEffect(() => {
    if (!shouldBegin || !room || begun.current) return;
    begun.current = true;
    beginRoomTraining(room)
      .then(() => router.replace("/training"))
      .catch((e) => {
        begun.current = false;
        setRefusal(messageOf(e));
      });
    // only the moment the room starts matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldBegin]);

  const closed = (title: string, text: string) => (
    <EmptyState
      title={title}
      action={
        <Link href="/training" className="u-btn u-btn--primary">
          Go to training
        </Link>
      }
    >
      {text}
    </EmptyState>
  );

  if (!valid || (error && !room))
    return closed(
      "This room was not found.",
      "The link may be mistyped, or the room is more than two days old.",
    );
  if (!user || !room) return <Loader />;
  if (refusal) return closed("You could not join this room.", refusal);
  if (room.status === "closed")
    return closed(
      "This room was closed.",
      `${room.hostName} left before starting it.`,
    );
  if (room.status === "ended")
    return closed(
      "This room has ended.",
      "Its time is up. Open a new one from the training page.",
    );
  if (!room.isMember && room.status !== "lobby")
    return closed(
      "This room has already started.",
      "Nobody can join after the start. Ask for the link earlier next time.",
    );

  const copyLink = async () => {
    const link = `${window.location.origin}/room/${room.code}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Invite link copied.",
        description: "Send it to the people you want in the room.",
        variant: "success",
      });
    } catch {
      toast({ title: "Copy this link", description: link });
    }
  };
  const give = async () => {
    setIsStarting(true);
    try {
      await start();
    } catch (e) {
      toast({
        title: "The room did not start",
        description: messageOf(e),
        variant: "destructive",
      });
    } finally {
      setIsStarting(false);
    }
  };
  const exit = async () => {
    await leave().catch(() => undefined);
    router.replace("/training");
  };

  const waitingToEnter = room.status === "running";
  return (
    <div className="room">
      <RoomLobby
        name={formatTrainingModeLabel(normalizeTrainingMode(room.trainingMode))}
        people={room.members}
        problemCount={room.problemCount}
        minutes={room.durationMinutes}
        ratingsHidden={!room.showRatings}
        waiting={
          waitingToEnter ? (
            <span>The start was given. Opening the room…</span>
          ) : room.isHost ? (
            <>
              <Button size="lg" onClick={give} disabled={isStarting}>
                <Play aria-hidden="true" fill="currentColor" />
                {isStarting ? "Starting…" : "Start for everyone"}
              </Button>
              <span>
                {room.members.length > 1
                  ? "Everyone gets the same problems and the same clock."
                  : "Copy the invite link and send it. Start when they are in."}
              </span>
            </>
          ) : (
            <span>Waiting for {room.hostName} to start.</span>
          )
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Link2 aria-hidden="true" />
              Copy invite link
            </Button>
            <Button variant="ghost" size="sm" onClick={exit}>
              <LogOut aria-hidden="true" />
              {room.isHost ? "Close room" : "Leave"}
            </Button>
          </>
        }
      />
    </div>
  );
}

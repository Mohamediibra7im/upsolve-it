"use client";

import type { ReactNode } from "react";
import { Rank } from "@/components/ui/kit";
import UserAvatar from "@/components/shared/UserAvatar";
import { useUser } from "@/hooks/auth";

const pad = (n: number) => n.toString().padStart(2, "0");
const slot = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : `${i + 1}`);

export type LobbyPerson = {
  id: string;
  name: string;
  avatar?: string | null;
  glyphAvatar?: string | null;
  codeforcesHandle?: string | null;
  rating?: number | null;
  isHost?: boolean;
};

/**
 * The room before its doors open: a dark stage, one beam of light, and one
 * figure in the middle of it. While the countdown runs that figure is the
 * seconds left; while a shared room waits for its host, it is how many people
 * are in. `leaving` plays the curtain: the stage rises off the room behind it.
 */
export default function RoomLobby({
  name,
  msLeft,
  waiting,
  people,
  problemCount,
  minutes,
  ratingsHidden,
  leaving = false,
  actions,
}: {
  /** The room's name, for example "Ladder". */
  name: string;
  /** Time until the start. Leave out while a shared room waits for its host. */
  msLeft?: number;
  /** A shared room that has not been started: what to say under the figure. */
  waiting?: ReactNode;
  /** Everyone in a shared room. Without it, the stage shows you alone. */
  people?: LobbyPerson[];
  problemCount: number;
  minutes: number;
  ratingsHidden: boolean;
  leaving?: boolean;
  /** The buttons in the corner: invite, cancel, leave. */
  actions: ReactNode;
}) {
  const { user } = useUser();
  const cast: LobbyPerson[] =
    people ??
    (user
      ? [
          {
            id: user._id,
            name: user.displayName || user.username || user.codeforcesHandle,
            avatar: user.avatar,
            glyphAvatar: user.glyphAvatar,
            codeforcesHandle: user.codeforcesHandle,
            rating: user.rating,
          },
        ]
      : []);

  const counting = msLeft !== undefined;
  const seconds = counting ? Math.max(0, Math.ceil(msLeft / 1000)) : 0;
  // under a hundred seconds the stage shows the bare number; before that, a clock
  const bare = seconds < 100;
  const shown = !counting
    ? `${cast.length}`
    : bare
      ? `${seconds}`
      : `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;

  return (
    <section
      aria-label={`${name} room, before the start`}
      className="lobby"
      data-hot={
        (counting && !leaving && seconds > 0 && seconds <= 3) || undefined
      }
      data-out={leaving || undefined}
    >
      <div className="lobby__beam" aria-hidden="true" />
      <div className="lobby__pool" aria-hidden="true" />

      <div className="lobby__top">
        <span className="lobby__tag">
          <i aria-hidden="true" />
          {name} room
        </span>
        <span className="flex flex-wrap items-center justify-end gap-2">
          {actions}
        </span>
      </div>

      <div className="lobby__mid">
        <span className="t-eyebrow">
          {counting ? "Doors open in" : "In the room"}
        </span>
        <b
          // a new element on every change, so the figure lands again each time
          key={shown}
          role={counting ? "timer" : undefined}
          aria-live="off"
          aria-label={
            counting
              ? `${seconds} seconds until your problems open`
              : `${cast.length} in the room`
          }
          className="lobby__num"
          data-clock={(counting && !bare) || undefined}
        >
          {shown}
        </b>
        {waiting && <div className="lobby__wait">{waiting}</div>}
      </div>

      <ul className="lobby__cast">
        {cast.map((p) => (
          <li key={p.id} data-me={p.id === user?._id || undefined}>
            <UserAvatar
              avatar={p.avatar}
              glyphAvatar={p.glyphAvatar}
              codeforcesHandle={p.codeforcesHandle ?? p.name}
              size={44}
            />
            <b>
              {p.id === user?._id && people ? "You" : p.name}
              {p.isHost && <span className="t-eyebrow"> · host</span>}
            </b>
            {p.rating ? <Rank rating={p.rating} showRating /> : null}
            <i aria-hidden="true" />
          </li>
        ))}
      </ul>

      <p className="lobby__foot">
        <span>
          {problemCount} {problemCount === 1 ? "problem" : "problems"}
        </span>
        <span>{minutes} minutes</span>
        <span>
          {ratingsHidden ? "Ratings hidden" : "Locked until the start"}
        </span>
        <span className="lobby__locks" aria-hidden="true">
          {Array.from({ length: problemCount }, (_, i) => (
            <i key={i}>{slot(i)}</i>
          ))}
        </span>
      </p>
    </section>
  );
}

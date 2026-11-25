"use client";

import UserAvatar from "@/components/shared/UserAvatar";
import type { RoomMember } from "@/types/Room";

const slot = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : `${i + 1}`);

/**
 * Everyone in the room and what each has solved, best first. Whoever left
 * stays, dimmed, with the line they left with. `row` is the strip across the
 * top of the room; without it, the list on the closing screen.
 */
export default function RoomStandings({
  members,
  problemIds,
  meId,
  row = false,
}: {
  members: RoomMember[];
  /** The room's problems in order: one mark per problem. */
  problemIds: string[];
  meId?: string;
  row?: boolean;
}) {
  return (
    <ol
      className="room-sb"
      data-row={row || undefined}
      aria-label="Standings in the room"
    >
      {members.map((m, i) => (
        <li
          key={m.id}
          data-me={m.id === meId || undefined}
          data-left={m.leftAt ? "" : undefined}
        >
          <span className="t-num" aria-hidden="true">
            {i + 1}
          </span>
          <UserAvatar
            avatar={m.avatar}
            glyphAvatar={m.glyphAvatar}
            codeforcesHandle={m.codeforcesHandle ?? m.name}
            size={26}
          />
          <b className="truncate">
            {m.id === meId ? "You" : m.name}
            {m.leftAt && <small>left</small>}
          </b>
          <span className="room-sb__marks">
            {problemIds.map((id, k) => {
              const state = m.solved.includes(id)
                ? "ok"
                : m.tried.includes(id)
                  ? "try"
                  : "";
              return (
                <i key={id} data-s={state || undefined}>
                  <span className="sr-only">
                    Problem {slot(k)}:{" "}
                    {state === "ok"
                      ? "solved"
                      : state === "try"
                        ? "tried"
                        : "not tried"}
                    .
                  </span>
                  <span aria-hidden="true">{slot(k)}</span>
                </i>
              );
            })}
          </span>
          <span className="t-num">
            {m.solved.length}/{problemIds.length}
          </span>
        </li>
      ))}
    </ol>
  );
}

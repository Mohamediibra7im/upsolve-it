import type { Room } from "@/types/Room";

/** The server's clock now, from the last answer and how long ago it came. */
export const serverTime = (room: Room, now: number) =>
  room.serverNow + (now - (room.receivedAt ?? now));

/**
 * Whether a session is shared right now: it came from a room, and someone
 * else is still in it. Until the room has been read it counts as shared, so
 * nobody ends a room alone in the first seconds.
 */
export const isSharedRoom = (
  roomCode: string | undefined,
  room: Room | undefined,
  meId: string | undefined,
) =>
  Boolean(roomCode) &&
  (!room || room.members.some((m) => m.id !== meId && !m.leftAt));

/** The running vote to end the room as this person sees it, or null. */
export function voteState(
  room: Room | undefined,
  meId: string | undefined,
  now: number,
) {
  const vote = room?.status === "running" ? room.endVote : null;
  if (!room || !vote) return null;
  const secondsLeft = Math.ceil((vote.endsAt - serverTime(room, now)) / 1000);
  // it ran out between two reads of the room
  if (secondsLeft <= 0) return null;
  return {
    byName: vote.byName,
    calledByMe: vote.by === meId,
    iAgreed: Boolean(meId) && vote.yes.includes(meId!),
    agreed: vote.yes.length,
    needed: vote.needed,
    secondsLeft,
  };
}

/** Why this person cannot call a vote now, or null when they can. */
export function voteBlocked(room: Room | undefined, now: number) {
  if (!room) return "Reading the room…";
  const wait = (room.voteAgainAt ?? 0) - serverTime(room, now);
  return wait > 0
    ? `You can call another vote in ${Math.ceil(wait / 60_000)} min.`
    : null;
}

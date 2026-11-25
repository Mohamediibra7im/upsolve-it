import { apiClient } from "@/lib/apiClient";
import type { Room } from "@/types/Room";
import type { Training } from "@/types/Training";
import { sessionPayload } from "./sessionPayload";

/** Where the running session is kept on this device (read by useTraining). */
export const TRAINING_STORAGE_KEY = "training-tracker-training";
export const SUBMISSION_STATUS_STORAGE_KEY =
  "training-tracker-submission-status";

/**
 * Turns a started room into this person's own session: the room's problems
 * and clock, saved the way any session is, so /training picks it up. The
 * room's times are the server's, so they are shifted by this device's clock
 * error. Safe to call twice for the same room.
 */
export async function beginRoomTraining(room: Room): Promise<void> {
  if (!room.problems || room.startTime == null || room.endTime == null)
    throw new Error("The room has not started.");
  try {
    const kept = JSON.parse(
      localStorage.getItem(TRAINING_STORAGE_KEY) ?? "null",
    );
    if (kept?.roomCode === room.code) return;
  } catch {
    // an unreadable leftover is replaced below
  }
  // One session per room: opening the link again after finishing or
  // discarding must not start the set a second time.
  const begunKey = `room-begun:${room.code}`;
  if (localStorage.getItem(begunKey))
    throw new Error("You have already finished or left this room.");
  localStorage.setItem(begunKey, "1");

  const skew = Date.now() - room.serverNow;
  const base: Training = {
    startTime: room.startTime + skew,
    endTime: room.endTime + skew,
    customRatings: room.customRatings ?? { P1: 0, P2: 0, P3: 0, P4: 0 },
    problems: room.problems.map((p) => ({ ...p, solvedTime: null })),
    performance: 0,
    trainingMode: room.trainingMode,
    showRatings: room.showRatings,
    durationMinutes: room.durationMinutes,
    level: room.level ?? "",
    roomCode: room.code,
  };

  let serverSessionId: string | undefined;
  try {
    const res = await apiClient.post<{ sessionId: string }>(
      "/api/training-sessions",
      sessionPayload(base),
    );
    serverSessionId = res.sessionId;
  } catch (e) {
    // as with a session of one: it still runs, saved on this device
    console.error("[training-sessions create]", e);
  }
  localStorage.setItem(
    TRAINING_STORAGE_KEY,
    JSON.stringify({ ...base, serverSessionId }),
  );
  localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
}

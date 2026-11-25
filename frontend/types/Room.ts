import type { Training } from "./Training";
import type { TrainingMode } from "./TrainingMode";
import type { TrainingProblem } from "./TrainingProblem";

/** One person in a room, with what they have solved and tried so far. */
export interface RoomMember {
  id: string;
  name: string;
  codeforcesHandle?: string | null;
  avatar?: string | null;
  glyphAvatar?: string | null;
  rating?: number | null;
  isHost: boolean;
  /** Problem ids ("contestId_index"). */
  solved: string[];
  tried: string[];
  solvedAt: Record<string, number>;
}

/** GET /api/rooms/:code, as the signed-in caller sees the room. */
export interface Room {
  code: string;
  /** `ended` is a running room whose time is up; `closed` was left by its host. */
  status: "lobby" | "running" | "ended" | "closed";
  isHost: boolean;
  isMember: boolean;
  hostName: string;
  trainingMode: TrainingMode;
  level?: string;
  durationMinutes: number;
  showRatings: boolean;
  problemCount: number;
  startTime: number | null;
  endTime: number | null;
  /** The server's clock when it answered, to correct this device's. */
  serverNow: number;
  /** Best first. */
  members: RoomMember[];
  /** Members only, and only once the room has started. */
  problems?: TrainingProblem[];
  customRatings?: Training["customRatings"];
}

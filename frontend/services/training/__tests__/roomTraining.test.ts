import {
  beginRoomTraining,
  TRAINING_STORAGE_KEY,
} from "@/services/training/roomTraining";
import type { Room } from "@/types/Room";

const post = jest.fn();
jest.mock("@/lib/apiClient", () => ({
  apiClient: { post: (...args: unknown[]) => post(...args) },
}));

const NOW = 1_800_000_000_000;
const room = (over: Partial<Room> = {}): Room => ({
  code: "abcd1234",
  status: "running",
  isHost: false,
  isMember: true,
  hostName: "host",
  trainingMode: "ladder",
  durationMinutes: 120,
  showRatings: true,
  problemCount: 1,
  // the server's clock is 4 s behind this device's
  serverNow: NOW - 4000,
  startTime: NOW - 4000 + 10_000,
  endTime: NOW - 4000 + 10_000 + 120 * 60_000,
  members: [],
  customRatings: { P1: 800, P2: 900, P3: 1000, P4: 1100 },
  problems: [
    {
      contestId: 4,
      index: "A",
      name: "Watermelon",
      rating: 800,
      tags: [],
      url: "https://codeforces.com/problemset/problem/4/A",
      solvedTime: null,
    } as unknown as NonNullable<Room["problems"]>[number],
  ],
  ...over,
});

describe("beginRoomTraining", () => {
  const stored = new Map<string, string>();
  beforeEach(() => {
    stored.clear();
    post.mockReset().mockResolvedValue({ sessionId: "s1" });
    (localStorage.getItem as jest.Mock).mockImplementation(
      (k: string) => stored.get(k) ?? null,
    );
    (localStorage.setItem as jest.Mock).mockImplementation(
      (k: string, v: string) => void stored.set(k, v),
    );
    (localStorage.removeItem as jest.Mock).mockImplementation(
      (k: string) => void stored.delete(k),
    );
    jest.spyOn(Date, "now").mockReturnValue(NOW);
  });
  afterEach(() => jest.restoreAllMocks());

  it("saves the room as this person's session, on this device's clock", async () => {
    await beginRoomTraining(room());
    const kept = JSON.parse(stored.get(TRAINING_STORAGE_KEY)!);
    expect(kept.roomCode).toBe("abcd1234");
    expect(kept.serverSessionId).toBe("s1");
    // ten seconds from now, whatever the two clocks say
    expect(kept.startTime).toBe(NOW + 10_000);
    expect(kept.endTime - kept.startTime).toBe(120 * 60_000);
    expect(post).toHaveBeenCalledWith(
      "/api/training-sessions",
      expect.objectContaining({
        trainingMode: "ladder",
        startTime: NOW + 10_000,
      }),
    );
  });

  it("does nothing the second time, and refuses once the session is gone", async () => {
    await beginRoomTraining(room());
    await beginRoomTraining(room());
    expect(post).toHaveBeenCalledTimes(1);

    stored.delete(TRAINING_STORAGE_KEY); // finished or discarded
    await expect(beginRoomTraining(room())).rejects.toThrow(/already finished/);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("still starts when the server did not save the session", async () => {
    post.mockRejectedValue(new Error("offline"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    await beginRoomTraining(room());
    expect(JSON.parse(stored.get(TRAINING_STORAGE_KEY)!).roomCode).toBe(
      "abcd1234",
    );
  });

  it("refuses a room that has not started", async () => {
    await expect(
      beginRoomTraining(
        room({ status: "lobby", startTime: null, problems: undefined }),
      ),
    ).rejects.toThrow(/not started/);
  });
});

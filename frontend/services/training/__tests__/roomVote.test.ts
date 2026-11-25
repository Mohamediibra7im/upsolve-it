import type { Room, RoomMember } from "@/types/Room";
import { isSharedRoom, voteBlocked, voteState } from "../roomVote";

const member = (id: string, extra: Partial<RoomMember> = {}): RoomMember => ({
  id,
  name: id,
  isHost: id === "a",
  solved: [],
  tried: [],
  solvedAt: {},
  ...extra,
});
// the server's clock is an hour ahead of this device's
const SERVER = 3_600_000;
const room = (extra: Partial<Room> = {}): Room => ({
  code: "abcd1234",
  status: "running",
  isHost: true,
  isMember: true,
  hostName: "a",
  trainingMode: "ladder",
  durationMinutes: 60,
  showRatings: true,
  problemCount: 4,
  startTime: SERVER,
  endTime: SERVER + 3_600_000,
  serverNow: SERVER + 10_000,
  receivedAt: 10_000,
  members: [member("a"), member("b")],
  ...extra,
});
const vote = {
  by: "b",
  byName: "Bea",
  endsAt: SERVER + 40_000,
  yes: ["b"],
  needed: 2,
};

it("is shared while someone else is still in the room", () => {
  expect(isSharedRoom(undefined, undefined, "a")).toBe(false);
  expect(isSharedRoom("abcd1234", undefined, "a")).toBe(true);
  expect(isSharedRoom("abcd1234", room(), "a")).toBe(true);
  expect(isSharedRoom("abcd1234", room({ members: [member("a")] }), "a")).toBe(
    false,
  );
  expect(
    isSharedRoom(
      "abcd1234",
      room({ members: [member("a"), member("b", { leftAt: 5 })] }),
      "a",
    ),
  ).toBe(false);
});

it("counts a vote down on the server's clock, between reads", () => {
  const r = room({ endVote: vote });
  expect(voteState(r, "a", 10_000)).toEqual({
    byName: "Bea",
    calledByMe: false,
    iAgreed: false,
    agreed: 1,
    needed: 2,
    secondsLeft: 30,
  });
  expect(voteState(r, "a", 25_500)?.secondsLeft).toBe(15);
  expect(voteState(r, "b", 10_000)).toMatchObject({
    calledByMe: true,
    iAgreed: true,
  });
  // run out, no vote, or a room that has ended
  expect(voteState(r, "a", 40_000)).toBeNull();
  expect(voteState(room(), "a", 10_000)).toBeNull();
  expect(
    voteState(room({ endVote: vote, status: "ended" }), "a", 10_000),
  ).toBeNull();
});

it("says how long the caller of a failed vote still waits", () => {
  expect(voteBlocked(undefined, 0)).toBe("Reading the room…");
  expect(voteBlocked(room(), 10_000)).toBeNull();
  const waiting = room({ voteAgainAt: SERVER + 10_000 + 130_000 });
  expect(voteBlocked(waiting, 10_000)).toBe(
    "You can call another vote in 3 min.",
  );
  expect(voteBlocked(waiting, 10_000 + 130_000)).toBeNull();
});

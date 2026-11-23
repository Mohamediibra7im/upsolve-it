import { dailyGoal } from "../dailyGoal";

const at = (iso: string) => Date.parse(iso);
const NOON = at("2026-11-23T12:00:00Z");

describe("dailyGoal", () => {
  it("is not done, with no streak, on an empty queue", () => {
    expect(dailyGoal([], NOON)).toEqual({ done: false, streak: 0 });
    expect(dailyGoal([null, undefined, 0], NOON)).toEqual({
      done: false,
      streak: 0,
    });
  });

  it("counts the days in a row, today included once it is done", () => {
    const solved = [
      at("2026-11-21T09:00:00Z"),
      at("2026-11-22T23:10:00Z"),
      at("2026-11-22T08:00:00Z"), // two on one day are one day
    ];
    expect(dailyGoal(solved, NOON)).toEqual({ done: false, streak: 2 });
    expect(dailyGoal([...solved, at("2026-11-23T01:00:00Z")], NOON)).toEqual({
      done: true,
      streak: 3,
    });
  });

  it("starts over after a missed day", () => {
    const solved = [
      at("2026-11-19T10:00:00Z"),
      at("2026-11-20T10:00:00Z"),
      // nothing on the 21st
      at("2026-11-22T10:00:00Z"),
    ];
    expect(dailyGoal(solved, NOON)).toEqual({ done: false, streak: 1 });
    // a whole day without a solve ends the run
    expect(dailyGoal(solved, at("2026-11-24T12:00:00Z"))).toEqual({
      done: false,
      streak: 0,
    });
  });

  it("splits days at midnight UTC", () => {
    const justBefore = at("2026-11-22T23:59:59Z");
    const justAfter = at("2026-11-23T00:00:00Z");
    expect(dailyGoal([justBefore], NOON)).toEqual({ done: false, streak: 1 });
    expect(dailyGoal([justAfter], NOON)).toEqual({ done: true, streak: 1 });
    expect(dailyGoal([justBefore, justAfter], NOON)).toEqual({
      done: true,
      streak: 2,
    });
  });

  it("reads times stored in seconds as well", () => {
    expect(dailyGoal([at("2026-11-23T03:00:00Z") / 1000], NOON).done).toBe(
      true,
    );
  });
});

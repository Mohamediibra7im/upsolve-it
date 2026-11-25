import {
  BREAK_BUDGET_MS,
  breakBudgetLeftMs,
  breakLeftMs,
  endBreak,
  startBreak,
} from "@/services/training/breaks";
import type { Training } from "@/types/Training";

const MIN = 60_000;
const NOW = 1_800_000_000_000;
const session = (over: Partial<Training> = {}): Training => ({
  startTime: NOW - 10 * MIN,
  endTime: NOW + 110 * MIN,
  customRatings: { P1: 800, P2: 800, P3: 800, P4: 800 },
  problems: [],
  performance: 0,
  ...over,
});

describe("session breaks", () => {
  it("moves the end by the break and remembers it in the session", () => {
    const t = startBreak(session(), 5, NOW);
    expect(t.endTime).toBe(NOW + 115 * MIN);
    expect(breakLeftMs(t, NOW + MIN)).toBe(4 * MIN);
    expect(breakBudgetLeftMs(t)).toBe(BREAK_BUDGET_MS - 5 * MIN);
  });

  it("gives back what an early resume did not use", () => {
    const onBreak = startBreak(session(), 10, NOW);
    const back = endBreak(onBreak, NOW + 3 * MIN);
    // three minutes were taken, not ten
    expect(back.endTime).toBe(NOW + 113 * MIN);
    expect(breakLeftMs(back, NOW + 3 * MIN)).toBe(0);
    expect(breakBudgetLeftMs(back)).toBe(BREAK_BUDGET_MS - 3 * MIN);
  });

  it("keeps the whole break when it runs to its end", () => {
    const onBreak = startBreak(session(), 5, NOW);
    expect(endBreak(onBreak, NOW + 6 * MIN).endTime).toBe(NOW + 115 * MIN);
  });

  it("does not stack breaks, and stops at the budget", () => {
    const first = startBreak(session(), 10, NOW);
    expect(startBreak(first, 5, NOW + MIN)).toBe(first);

    const later = NOW + 20 * MIN;
    const second = startBreak(first, 10, later); // only five are left
    expect(breakLeftMs(second, later)).toBe(5 * MIN);
    expect(breakBudgetLeftMs(second)).toBe(0);
    expect(startBreak(second, 5, later + 10 * MIN)).toBe(second);
  });

  it("gives a shared room no breaks: its clock is everyone's", () => {
    const room = session({ roomCode: "abcd1234" });
    expect(breakBudgetLeftMs(room)).toBe(0);
    expect(startBreak(room, 5, NOW)).toBe(room);
  });
});

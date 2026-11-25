import type { Training } from "@/types/Training";

/** All the break a session may take, however it is split. */
export const BREAK_BUDGET_MS = 15 * 60_000;

/** Time left on the running break; 0 when not on one. */
export const breakLeftMs = (t: Training, now: number) =>
  Math.max(0, (t.breakUntil ?? 0) - now);

/** Break time the session can still take. A room has none: its clock is shared. */
export const breakBudgetLeftMs = (t: Training) =>
  t.roomCode ? 0 : Math.max(0, BREAK_BUDGET_MS - (t.breakUsedMs ?? 0));

/**
 * Starts a break: the session ends that much later, and the break is kept in
 * the session itself, so a reload does not turn it into free solving time.
 * Asking for more than the budget has left gives what is left.
 */
export function startBreak(
  t: Training,
  minutes: number,
  now: number,
): Training {
  if (breakLeftMs(t, now) > 0) return t;
  const ms = Math.min(minutes * 60_000, breakBudgetLeftMs(t));
  if (ms <= 0) return t;
  return {
    ...t,
    endTime: t.endTime + ms,
    breakUntil: now + ms,
    breakUsedMs: (t.breakUsedMs ?? 0) + ms,
  };
}

/** Ends a break early: what was not used goes back, off the clock and into the budget. */
export function endBreak(t: Training, now: number): Training {
  const unused = breakLeftMs(t, now);
  if (!t.breakUntil) return t;
  return {
    ...t,
    endTime: t.endTime - unused,
    breakUntil: undefined,
    breakUsedMs: Math.max(0, (t.breakUsedMs ?? 0) - unused),
  };
}

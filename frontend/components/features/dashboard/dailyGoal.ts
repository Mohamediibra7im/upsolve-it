const DAY_MS = 86_400_000;

/** Days since 1970 in UTC, from a time in seconds or milliseconds. */
const utcDay = (time: number) =>
  Math.floor((time < 1e10 ? time * 1000 : time) / DAY_MS);

/**
 * "One upsolve a day": whether a problem of the queue was solved today, and
 * for how many days in a row the goal has been met. A day is a UTC day, the
 * same rule the streaks use. The run still counts while today is open: it
 * only breaks once a whole day has passed without a solve.
 *
 * ponytail: read from the queue's own solve times, so a solved problem that
 * was later removed from the queue no longer counts for its day.
 */
export function dailyGoal(
  solvedTimes: (number | null | undefined)[],
  now: number = Date.now(),
) {
  const days = new Set(
    solvedTimes
      .filter((t): t is number => typeof t === "number" && t > 0)
      .map(utcDay),
  );
  const today = utcDay(now);
  const done = days.has(today);
  let streak = 0;
  for (let day = done ? today : today - 1; days.has(day); day--) streak++;
  return { done, streak };
}

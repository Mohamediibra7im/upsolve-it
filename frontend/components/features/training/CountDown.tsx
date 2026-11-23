import { useState, useEffect } from "react";

type CountDownProps = {
  startTime: number;
  endTime: number;
  /** Only the clock, small, for a bar: no label above it. */
  compact?: boolean;
};

const pad = (n: number) => n.toString().padStart(2, "0");

/** The session clock with its label: counts down to the start, then to the end. */
const CountDown = ({ startTime, endTime, compact }: CountDownProps) => {
  const [, setTick] = useState<number>(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const now = Date.now();
    if (now >= endTime) return;

    const timer = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= endTime) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, mounted]);

  if (!mounted) {
    return (
      <span role="status" className="t-sm t-muted">
        Syncing timer…
      </span>
    );
  }

  const now = Date.now();
  const isStarted = now >= startTime;
  const timeLeft = Math.max(0, (isStarted ? endTime : startTime) - now);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const over = timeLeft === 0;
  const warn = isStarted && !over && timeLeft < 5 * 60 * 1000;

  return (
    <>
      <span className={compact ? "sr-only" : "t-eyebrow"}>
        {!isStarted
          ? "Starting in"
          : over
            ? "Time’s up"
            : warn
              ? "Almost out of time"
              : "Time remaining"}
      </span>
      <span
        role="timer"
        aria-live="off"
        aria-label={`${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        className={compact ? "u-timer u-timer--sm" : "u-timer"}
        data-warn={warn || undefined}
        data-over={over || undefined}
      >
        {pad(hours)}
        <small>h</small>
        {pad(minutes)}
        <small>m</small>
        {pad(seconds)}
        <small>s</small>
      </span>
    </>
  );
};

export default CountDown;

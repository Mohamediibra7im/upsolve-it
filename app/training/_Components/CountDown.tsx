import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type CountDownProps = {
  startTime: number;
  endTime: number;
  /** Tighter layout for the mobile session bar */
  compact?: boolean;
};

function Segment({
  value,
  label,
  compact,
  urgent,
}: {
  value: string;
  label: string;
  compact?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border bg-card/40 backdrop-blur-sm transition-colors duration-300",
        compact ? "min-w-[3.25rem] px-2 py-2" : "min-w-[4.5rem] px-3 py-4 sm:min-w-[5.25rem] sm:px-4 sm:py-5",
        urgent
          ? "border-amber-500/35 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
          : "border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
    >
      <span
        className={cn(
          "font-black tabular-nums leading-none tracking-tight text-foreground",
          compact ? "text-xl" : "text-3xl sm:text-4xl",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mt-1.5 font-bold uppercase tracking-[0.2em] text-muted-foreground/90",
          compact ? "text-[8px]" : "text-[10px]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Colon({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center self-center font-light text-primary/35 select-none",
        compact ? "pb-5 text-lg" : "pb-8 text-2xl sm:text-3xl",
      )}
      aria-hidden
    >
      :
    </span>
  );
}

const CountDown = ({ startTime, endTime, compact }: CountDownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      if (now < startTime) {
        setIsStarted(false);
        return startTime - now;
      }
      if (now < endTime) {
        setIsStarted(true);
        return endTime - now;
      }
      setIsStarted(true);
      return 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, mounted]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl border border-border/50 bg-muted/20",
          compact ? "h-16 px-3" : "h-28 px-4",
        )}
      >
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary/50" />
        <span className="text-xs font-medium text-muted-foreground">Syncing…</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const urgent =
    isStarted && timeLeft > 0 && timeLeft < 5 * 60 * 1000;

  if (timeLeft === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/40 bg-muted/10 text-center",
          compact ? "px-3 py-2" : "px-4 py-5",
        )}
      >
        {isStarted ? (
          <p
            className={cn(
              "font-semibold text-rose-500 dark:text-rose-400",
              compact ? "text-sm" : "text-base",
            )}
          >
            Session time is up
          </p>
        ) : (
          <p
            className={cn(
              "font-medium text-sky-600 dark:text-sky-400",
              compact ? "text-sm" : "text-base",
            )}
          >
            Starting soon
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isStarted && !compact && (
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Countdown to start
        </p>
      )}
      <div
        className={cn(
          "flex w-full items-stretch justify-center",
          compact ? "gap-0.5" : "gap-1 sm:gap-2",
        )}
      >
        <Segment
          value={hours.toString().padStart(2, "0")}
          label="Hrs"
          compact={compact}
          urgent={urgent}
        />
        <Colon compact={compact} />
        <Segment
          value={minutes.toString().padStart(2, "0")}
          label="Min"
          compact={compact}
          urgent={urgent}
        />
        <Colon compact={compact} />
        <Segment
          value={seconds.toString().padStart(2, "0")}
          label="Sec"
          compact={compact}
          urgent={urgent}
        />
      </div>
    </div>
  );
};

export default CountDown;

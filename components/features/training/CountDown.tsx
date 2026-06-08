import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type CountDownProps = {
  startTime: number;
  endTime: number;
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
        "flex flex-col items-center justify-center rounded-xl border transition-all duration-500",
        compact ? "min-w-[2.75rem] px-2 py-2" : "min-w-[3.75rem] px-3 py-3 sm:min-w-[4.25rem] sm:px-4 sm:py-3.5",
        urgent
          ? "border-amber-500/30 bg-amber-500/[0.06] shadow-[0_0_20px_-4px_rgba(245,158,11,0.15)]"
          : "border-white/[0.04] bg-white/[0.02]",
      )}
    >
      <span
        className={cn(
          "font-black tabular-nums leading-none text-foreground/90",
          compact ? "text-lg" : "text-2xl sm:text-3xl",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mt-1.5 font-bold uppercase tracking-widest text-muted-foreground/40",
          compact ? "text-[7px]" : "text-[9px]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground/20 select-none",
        compact ? "pb-4 text-base" : "pb-6 text-xl sm:text-2xl",
      )}
      aria-hidden
    >
      :
    </span>
  );
}

const CountDown = ({ startTime, endTime, compact }: CountDownProps) => {
  const [_tick, setTick] = useState<number>(0);
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

  const getTimerState = () => {
    if (!mounted) return { isStarted: false, timeLeft: 0 };
    const now = Date.now();
    if (now < startTime) return { isStarted: false, timeLeft: startTime - now };
    if (now < endTime) return { isStarted: true, timeLeft: endTime - now };
    return { isStarted: true, timeLeft: 0 };
  };

  const { isStarted, timeLeft } = getTimerState();

  if (!mounted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02]",
          compact ? "h-12 px-3" : "h-20 px-4",
        )}
      >
        <div className="size-1 animate-pulse rounded-full bg-primary/50" />
        <span className="text-[10px] font-medium text-muted-foreground/40">Syncing...</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const urgent = isStarted && timeLeft > 0 && timeLeft < 5 * 60 * 1000;

  if (timeLeft === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/[0.04] bg-white/[0.02] text-center",
          compact ? "px-3 py-2.5" : "px-4 py-4",
        )}
      >
        {isStarted ? (
          <p className={cn("font-semibold text-rose-400", compact ? "text-xs" : "text-sm")}>
            Time&apos;s up
          </p>
        ) : (
          <p className={cn("font-medium text-sky-400", compact ? "text-xs" : "text-sm")}>
            Starting soon
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {!isStarted && !compact && (
        <p className="mb-2.5 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
          Starting in
        </p>
      )}
      <div
        className={cn(
          "flex w-full items-stretch justify-center",
          compact ? "gap-1" : "gap-1.5 sm:gap-2",
        )}
      >
        <Segment
          value={hours.toString().padStart(2, "0")}
          label="Hrs"
          compact={compact}
          urgent={urgent}
        />
        <Separator compact={compact} />
        <Segment
          value={minutes.toString().padStart(2, "0")}
          label="Min"
          compact={compact}
          urgent={urgent}
        />
        <Separator compact={compact} />
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

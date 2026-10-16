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
        "flex flex-col items-center justify-center rounded-xl border font-sans",
        compact
          ? "min-w-[2.5rem] px-1 py-1.5"
          : "min-w-[3.5rem] px-3 py-3 sm:min-w-[4rem]",
        urgent
          ? "border-[#d5b98a]/30 bg-[#d5b98a]/5 text-[#d5b98a]"
          : "border-[#2b3031] bg-[#101214] text-[#f1f3ee]",
      )}
    >
      <span
        className={cn(
          "font-heading font-medium tabular-nums leading-none",
          compact ? "text-base" : "text-xl sm:text-2xl",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mt-1.5 text-xs",
          urgent ? "text-[#d5b98a]" : "text-[#929b98]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({
  compact,
  urgent,
}: {
  compact?: boolean;
  urgent?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center font-sans select-none",
        compact ? "pb-2 text-sm" : "pb-4 text-lg",
        urgent ? "text-[#d5b98a]" : "text-[#69746e]",
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
          "flex items-center justify-center gap-2 rounded-xl border border-[#2b3031] font-sans text-[#929b98]",
          compact ? "h-10 px-3 text-xs" : "h-16 px-4 text-xs",
        )}
      >
        <div className="size-1.5 rounded-full bg-[#b5e3c4]" />
        <span>Syncing timer…</span>
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
          "rounded-xl border font-sans text-center",
          compact ? "px-3 py-1.5" : "px-4 py-3",
          isStarted
            ? "border-[#e5a39d]/30 bg-[#e5a39d]/5 text-[#e5a39d]"
            : "border-[#b5e3c4]/30 bg-[#b5e3c4]/5 text-[#b5e3c4]",
        )}
      >
        {isStarted ? (
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            Time’s up
          </p>
        ) : (
          <p className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
            Starting soon
          </p>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div
        role="timer"
        aria-live="off"
        aria-label={`${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
        className={cn(
          "font-heading text-2xl font-medium leading-none tabular-nums tracking-tight",
          urgent ? "text-[#d5b98a]" : "text-[#f1f3ee]",
        )}
      >
        {hours.toString().padStart(2, "0")}:
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      {!isStarted && !compact && (
        <p className="mb-2 text-center text-xs text-[#929b98]">
          Your session starts in
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
        <Separator compact={compact} urgent={urgent} />
        <Segment
          value={minutes.toString().padStart(2, "0")}
          label="Min"
          compact={compact}
          urgent={urgent}
        />
        <Separator compact={compact} urgent={urgent} />
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

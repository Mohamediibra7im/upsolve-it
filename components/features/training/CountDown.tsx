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
        "flex flex-col items-center justify-center rounded border transition-all duration-300 font-mono",
        compact ? "min-w-[2.5rem] px-1 py-1.5" : "min-w-[3.5rem] px-2 py-2.5 sm:min-w-[4rem]",
        urgent
          ? "border-amber-500/30 bg-amber-950/10 text-amber-400 glow-text-amber"
          : "border-emerald-500/15 bg-transparent text-emerald-400 glow-text-emerald",
      )}
    >
      <span
        className={cn(
          "font-black tabular-nums leading-none",
          compact ? "text-base" : "text-xl sm:text-2xl",
        )}
      >
        {value}
      </span>
      <span
        className={cn(
          "mt-1 font-bold uppercase tracking-widest text-[8px]",
          urgent ? "text-amber-500/40" : "text-emerald-500/40",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function Separator({ compact, urgent }: { compact?: boolean; urgent?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center font-mono select-none",
        compact ? "pb-2 text-sm" : "pb-4 text-lg",
        urgent ? "text-amber-500/35" : "text-emerald-500/35",
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
          "flex items-center justify-center gap-2 rounded border border-emerald-500/15 bg-transparent font-mono text-emerald-500/40",
          compact ? "h-10 px-3 text-[10px]" : "h-16 px-4 text-xs",
        )}
      >
        <div className="size-1 animate-pulse rounded-full bg-emerald-500/50" />
        <span>[ SYNCING_TIME_TELEMETRY... ]</span>
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
          "rounded border font-mono text-center",
          compact ? "px-3 py-1.5" : "px-4 py-3",
          isStarted
            ? "border-red-500/30 bg-red-950/10 text-red-400"
            : "border-cyan-500/30 bg-cyan-950/10 text-cyan-400",
        )}
      >
        {isStarted ? (
          <p className={cn("font-bold uppercase tracking-widest", compact ? "text-[9px]" : "text-xs")}>
            [ SESSION_TIME_EXPIRED ]
          </p>
        ) : (
          <p className={cn("font-bold uppercase tracking-widest", compact ? "text-[9px]" : "text-xs")}>
            [ COMPILE_START_SOON ]
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full font-mono">
      {!isStarted && !compact && (
        <p className="mb-1.5 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-500/40">
          compile_start_in
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

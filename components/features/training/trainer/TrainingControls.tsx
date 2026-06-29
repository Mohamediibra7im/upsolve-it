"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, XCircle, Clock, Target, Square, Coffee } from "lucide-react";
import CountDown from "../CountDown";
import { Training } from "@/types/Training";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const BREAK_OPTIONS = [5, 10, 15] as const;

interface TrainingControlsProps {
  training: Training | null;
  isTraining: boolean;
  isPreContestPeriod: boolean;
  solvedCount: number;
  totalCount: number;
  isRefreshing: boolean;
  refreshProblemStatus: () => void;
  onFinishTraining: () => void;
  onStopTraining: () => void;
  onExtendEndTime?: (minutes: number) => void;
}

const TrainingControls = ({
  training,
  isTraining,
  isPreContestPeriod,
  solvedCount,
  totalCount,
  isRefreshing,
  refreshProblemStatus,
  onFinishTraining,
  onStopTraining,
  onExtendEndTime,
}: TrainingControlsProps) => {
  // ponytail: break = freeze session timer. Record remaining on start, extend on end.
  const [breakEndTime, setBreakEndTime] = useState<number | null>(null);
  const [showBreakPicker, setShowBreakPicker] = useState(false);
  const [, setTick] = useState(0);

  const isOnBreak = breakEndTime !== null && Date.now() < breakEndTime;

  // tick every second to update break countdown
  useEffect(() => {
    if (!isOnBreak) return;
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= breakEndTime!) {
        clearInterval(timer);
        setBreakEndTime(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isOnBreak, breakEndTime]);

  const startBreak = useCallback((minutes: number) => {
    setBreakEndTime(Date.now() + minutes * 60000);
    setShowBreakPicker(false);
    // ponytail: extend endTime NOW to prevent auto-finish timer from killing session during break
    onExtendEndTime?.(minutes);
  }, [onExtendEndTime]);

  // ponytail: setter is stable, useCallback unnecessary
  const endBreakEarly = () => setBreakEndTime(null);

  if (!training) return null;

  const breakRemaining = isOnBreak ? Math.max(0, breakEndTime! - Date.now()) : 0;
  const breakMinutes = Math.floor(breakRemaining / 60000);
  const breakSeconds = Math.floor((breakRemaining % 60000) / 1000);

  const renderBreakBanner = () => {
    if (!isOnBreak) return null;
    return (
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.06] p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Coffee className="size-4 text-sky-400" />
          <span className="text-xs font-semibold text-sky-300">On Break</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-sky-200 tabular-nums">
            {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={endBreakEarly}
            className="text-[10px] font-bold uppercase tracking-wider border-sky-500/20 text-sky-300 hover:bg-sky-500/10"
          >
            End Break
          </Button>
        </div>
      </div>
    );
  };

  const renderBreakPicker = () => {
    if (!showBreakPicker) return null;
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
          Break duration
        </p>
        <div className="flex gap-2">
          {BREAK_OPTIONS.map((min) => (
            <Button
              key={min}
              size="sm"
              variant="outline"
              onClick={() => startBreak(min)}
              className="flex-1 text-xs font-bold border-white/[0.06] text-foreground hover:bg-white/[0.06]"
            >
              {min}m
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderActionButtons = (isMobile = false) => {
    const buttonClass = isMobile
      ? "h-11 flex-1 text-[10px] font-bold uppercase tracking-wider"
      : "w-full h-11 text-[11px] font-bold uppercase tracking-wider";

    if (isTraining && isPreContestPeriod) {
      return (
        <Button
          variant="destructive"
          onClick={onStopTraining}
          className={cn(buttonClass, "bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20")}
        >
          <XCircle className="size-3.5 mr-2" />
          Cancel Session
        </Button>
      );
    }

    if (isTraining) {
      return (
        <div className={cn("space-y-2.5", isMobile && "flex items-center gap-2 space-y-0")}>
          {isOnBreak ? (
            // ponytail: banner has End Break button. Mobile bottom bar handles mobile break UI.
            null
          ) : (
            <>
              <Button
                variant="outline"
                onClick={refreshProblemStatus}
                className={cn(buttonClass, "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-foreground")}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("size-3.5 mr-2", isRefreshing ? "animate-spin" : "")} />
                {isRefreshing ? "Refreshing..." : "Refresh Status"}
              </Button>

              {!isMobile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/[0.04] border border-primary/10">
                  <RefreshCw className="size-3 text-primary/60 shrink-0" />
                  <p className="text-[10px] text-primary/70 leading-relaxed">
                    Click after each submit to update status
                  </p>
                </div>
              )}

              {!isMobile && onExtendEndTime && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowBreakPicker(!showBreakPicker)}
                    className={cn(buttonClass, "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-foreground")}
                  >
                    <Coffee className="size-3.5 mr-2" />
                    Take Break
                  </Button>
                  {renderBreakPicker()}
                </>
              )}

              <Button
                onClick={onFinishTraining}
                className={cn(buttonClass, "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-4px_rgba(var(--primary),0.4)]")}
              >
                <Trophy className="size-3.5 mr-2" />
                Finish Session
              </Button>

              {!isMobile && (
                <button
                  onClick={onStopTraining}
                  className="w-full py-2.5 text-[10px] font-medium text-muted-foreground/50 hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Square className="size-2.5" />
                  Stop Training
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <m.div variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl overflow-hidden shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)]">
              <div className="p-6 space-y-6">
                {isOnBreak ? (
                  renderBreakBanner()
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="size-4 text-primary" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {isPreContestPeriod ? "Starting In" : "Time Remaining"}
                      </span>
                    </div>
                    <CountDown
                      startTime={training.startTime}
                      endTime={training.endTime}
                    />
                  </div>
                )}

                <div className="h-px bg-white/[0.04]" />

                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="size-4 text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      Progress
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground tabular-nums">{solvedCount}</span>
                    <span className="text-sm text-muted-foreground/60">/ {totalCount} solved</span>
                  </div>
                </div>

                <div className="h-px bg-white/[0.04]" />

                {renderActionButtons()}
              </div>
            </div>
          </m.div>

          <m.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5">
              <p className="text-[11px] leading-relaxed text-muted-foreground/50 italic">
                &quot;Precision and speed are the keys to victory. Stay focused and keep pushing.&quot;
              </p>
            </div>
          </m.div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <AnimatePresence>
        {isTraining && (
          <m.div
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mx-3 mb-3 rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-2xl shadow-[0_-4px_30px_-4px_rgba(0,0,0,0.5)]">
              <div className="px-4 py-3">
                {isOnBreak ? (
                  <div className="flex items-center gap-3">
                    <Coffee className="size-4 text-sky-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-sky-400/70 mb-1">Break</div>
                      <span className="text-lg font-black text-sky-200 tabular-nums">
                        {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={endBreakEarly}
                      className="text-[9px] font-bold uppercase tracking-wider border-sky-500/20 text-sky-300 hover:bg-sky-500/10 shrink-0"
                    >
                      Resume
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                        {isPreContestPeriod ? "Starting In" : "Time Left"}
                      </div>
                      <CountDown
                        startTime={training.startTime}
                        endTime={training.endTime}
                        compact
                      />
                    </div>

                    <div className="h-12 w-px bg-white/[0.06]" />

                    <div className="text-center shrink-0">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5">Solved</div>
                      <div className="text-xl font-black text-foreground tabular-nums">
                        {solvedCount}<span className="text-sm font-medium text-muted-foreground/40">/{totalCount}</span>
                      </div>
                    </div>

                    <div className="h-12 w-px bg-white/[0.06]" />

                    <div className="shrink-0">
                      {renderActionButtons(true)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrainingControls;

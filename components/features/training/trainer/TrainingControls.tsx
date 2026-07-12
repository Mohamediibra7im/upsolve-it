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
  const [breakEndTime, setBreakEndTime] = useState<number | null>(null);
  const [showBreakPicker, setShowBreakPicker] = useState(false);
  const [, setTick] = useState(0);

  const isOnBreak = breakEndTime !== null && Date.now() < breakEndTime;

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
    onExtendEndTime?.(minutes);
  }, [onExtendEndTime]);

  const endBreakEarly = () => setBreakEndTime(null);

  if (!training) return null;

  const breakRemaining = isOnBreak ? Math.max(0, breakEndTime! - Date.now()) : 0;
  const breakMinutes = Math.floor(breakRemaining / 60000);
  const breakSeconds = Math.floor((breakRemaining % 60000) / 1000);

  const renderBreakBanner = () => {
    if (!isOnBreak) return null;
    return (
      <div className="rounded border border-cyan-500/20 bg-cyan-950/10 p-4 space-y-3 font-mono text-cyan-400">
        <div className="flex items-center gap-2">
          <Coffee size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">[ BREAK_MODE_ACTIVE ]</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-cyan-300 tabular-nums">
            {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={endBreakEarly}
            className="text-[9px] font-bold uppercase tracking-wider border-cyan-500/35 bg-transparent text-cyan-300 hover:bg-cyan-500/10 h-7 rounded font-mono"
          >
            [ RESUME.SH ]
          </Button>
        </div>
      </div>
    );
  };

  const renderBreakPicker = () => {
    if (!showBreakPicker) return null;
    return (
      <div className="rounded border border-emerald-500/15 bg-emerald-950/5 p-3 space-y-2 font-mono">
        <p className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
          select break duration
        </p>
        <div className="flex gap-2">
          {BREAK_OPTIONS.map((min) => (
            <Button
              key={min}
              size="sm"
              variant="outline"
              onClick={() => startBreak(min)}
              className="flex-1 text-[10px] font-bold border-emerald-500/35 text-emerald-400 bg-transparent hover:bg-emerald-500/10 h-7 rounded font-mono"
            >
              {min}M
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderActionButtons = (isMobile = false) => {
    const buttonClass = isMobile
      ? "h-9 flex-1 text-[9px] font-bold uppercase tracking-widest rounded border font-mono bg-transparent"
      : "w-full h-10 text-[9px] font-bold uppercase tracking-widest rounded border font-mono bg-transparent";

    if (isTraining && isPreContestPeriod) {
      return (
        <Button
          variant="outline"
          onClick={onStopTraining}
          className={cn(buttonClass, "border-red-500/35 text-red-400 hover:bg-red-500/10 hover:border-red-500/60")}
        >
          <XCircle size={13} className="mr-1.5" />
          [ CANCEL_SESSION.SH ]
        </Button>
      );
    }

    if (isTraining) {
      return (
        <div className={cn("space-y-2.5", isMobile && "flex items-center gap-2 space-y-0")}>
          {isOnBreak ? null : (
            <>
              <Button
                variant="outline"
                onClick={refreshProblemStatus}
                className={cn(buttonClass, "border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/10")}
                disabled={isRefreshing}
              >
                <RefreshCw size={12} className={cn("mr-1.5", isRefreshing ? "animate-spin" : "")} />
                {isRefreshing ? "[ REFRESHING... ]" : "[ REFRESH_STATUS.SH ]"}
              </Button>

              {!isMobile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/10 bg-emerald-950/5">
                  <RefreshCw size={10} className="text-emerald-500/40 shrink-0" />
                  <p className="text-[8px] text-emerald-500/50 leading-normal uppercase">
                    Submit on CF then trigger refresh
                  </p>
                </div>
              )}

              {!isMobile && onExtendEndTime && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowBreakPicker(!showBreakPicker)}
                    className={cn(buttonClass, "border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/10")}
                  >
                    <Coffee size={12} className="mr-1.5" />
                    [ COFFEE_BREAK.SH ]
                  </Button>
                  {renderBreakPicker()}
                </>
              )}

              <Button
                onClick={onFinishTraining}
                className={cn(
                  isMobile
                    ? "h-9 flex-1 text-[9px] font-bold uppercase tracking-widest rounded font-mono bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                    : "w-full h-10 text-[9px] font-bold uppercase tracking-widest rounded font-mono bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                )}
              >
                <Trophy size={12} className="mr-1.5" />
                [ FINISH_RUN.EXE ]
              </Button>

              {!isMobile && (
                <button
                  onClick={onStopTraining}
                  className="w-full py-1 text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 hover:text-red-400 hover:glow-text-red transition-all flex items-center justify-center gap-1"
                >
                  <Square size={8} />
                  [ STOP_TRAINING ]
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
      <div className="hidden lg:block font-mono text-emerald-400 w-full">
        <div className="sticky top-6 space-y-4">
          <m.div variants={fadeUp} initial="hidden" animate="show">
            <div className="rounded-xl border border-emerald-500/15 bg-[#060a08]/50 p-6 space-y-5 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none z-10 bg-terminal-scanlines opacity-[0.06]" />
              
              {isOnBreak ? (
                renderBreakBanner()
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500/40 uppercase tracking-widest">
                    <Clock size={14} className="text-emerald-400 animate-pulse" />
                    <span>{isPreContestPeriod ? "STARTING_IN" : "TIME_REMAINING"}</span>
                  </div>
                  <CountDown
                    startTime={training.startTime}
                    endTime={training.endTime}
                  />
                </div>
              )}

              <div className="h-px bg-emerald-500/10" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-emerald-500/40 uppercase tracking-widest">
                  <Target size={14} className="text-emerald-400" />
                  <span>METRICS_PROGRESS</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-300 glow-text-emerald tabular-nums leading-none">{solvedCount}</span>
                  <span className="text-xs text-emerald-500/60">/ {totalCount} solved nodes</span>
                </div>
              </div>

              <div className="h-px bg-emerald-500/10" />

              {renderActionButtons()}
            </div>
          </m.div>

          <m.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.1 }}
          >
            <div className="rounded-xl border border-emerald-500/10 bg-transparent p-4">
              <p className="text-[10px] leading-relaxed text-emerald-500/45 italic">
                &quot;Precision and speed are the keys to compilation integrity. Stay focused.&quot;
              </p>
            </div>
          </m.div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <AnimatePresence>
        {isTraining && (
          <m.div
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden font-mono text-emerald-400"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="mx-3 mb-3 rounded-xl border border-emerald-500/25 bg-black/90 backdrop-blur-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
              <div className="px-4 py-3">
                {isOnBreak ? (
                  <div className="flex items-center gap-3">
                    <Coffee size={14} className="text-cyan-400 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-400/70 mb-0.5">BREAK</div>
                      <span className="text-lg font-black text-cyan-300 tabular-nums">
                        {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={endBreakEarly}
                      className="text-[9px] font-bold uppercase tracking-wider border-cyan-500/35 bg-transparent text-cyan-300 hover:bg-cyan-500/10 shrink-0 h-7 rounded font-mono"
                    >
                      [ RESUME ]
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[7px] font-bold uppercase tracking-widest text-emerald-500/40 mb-0.5">
                        {isPreContestPeriod ? "STARTING_IN" : "TIME_LEFT"}
                      </div>
                      <CountDown
                        startTime={training.startTime}
                        endTime={training.endTime}
                        compact
                      />
                    </div>

                    <div className="h-10 w-px bg-emerald-500/10" />

                    <div className="text-center shrink-0">
                      <div className="text-[7px] font-bold uppercase tracking-widest text-emerald-500/40 mb-0.5">SOLVED</div>
                      <div className="text-base font-black text-emerald-300 glow-text-emerald tabular-nums">
                        {solvedCount}<span className="text-[10px] font-normal text-emerald-500/40">/{totalCount}</span>
                      </div>
                    </div>

                    <div className="h-10 w-px bg-emerald-500/10" />

                    <div className="shrink-0 flex items-center">
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

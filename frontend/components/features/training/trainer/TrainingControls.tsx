"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Trophy,
  XCircle,
  Clock,
  Target,
  Square,
  Coffee,
  MoreHorizontal,
} from "lucide-react";
import CountDown from "../CountDown";
import { Training } from "@/types/Training";
import { cn } from "@/lib/utils";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
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
  const [showMobileActions, setShowMobileActions] = useState(false);
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

  const startBreak = useCallback(
    (minutes: number) => {
      setBreakEndTime(Date.now() + minutes * 60000);
      setShowBreakPicker(false);
      onExtendEndTime?.(minutes);
    },
    [onExtendEndTime],
  );

  const endBreakEarly = () => setBreakEndTime(null);

  if (!training) return null;

  const breakRemaining = isOnBreak
    ? Math.max(0, breakEndTime! - Date.now())
    : 0;
  const breakMinutes = Math.floor(breakRemaining / 60000);
  const breakSeconds = Math.floor((breakRemaining % 60000) / 1000);

  const renderBreakBanner = () => {
    if (!isOnBreak) return null;
    return (
      <div className="space-y-4 rounded-xl border border-[#b5e3c4]/20 bg-[#b5e3c4]/5 p-4">
        <div className="flex items-center gap-2 text-sm text-[#b5e3c4]">
          <Coffee className="size-4" />
          <span>Take a breather</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-heading text-3xl font-medium text-[#f1f3ee] tabular-nums">
            {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={endBreakEarly}
            className="rounded-lg border-[#39403c] bg-transparent text-xs text-[#b5e3c4] hover:bg-[#b5e3c4]/10 hover:text-[#d2eedb]"
          >
            Resume session
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-[#929b98]">
          Your session has been extended by the break duration.
        </p>
      </div>
    );
  };

  const renderBreakPicker = () => {
    if (!showBreakPicker) return null;
    return (
      <div className="space-y-3 rounded-xl border border-[#2b3031] bg-[#101214] p-4">
        <p className="text-xs text-[#929b98]">How long would you like?</p>
        <div className="flex gap-2">
          {BREAK_OPTIONS.map((min) => (
            <Button
              key={min}
              size="sm"
              variant="outline"
              onClick={() => startBreak(min)}
              className="flex-1 rounded-lg border-[#39403c] bg-transparent text-xs text-[#b8c0bb] hover:border-[#b5e3c4]/40 hover:bg-[#b5e3c4]/5 hover:text-[#b5e3c4]"
            >
              {min} min
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderActionButtons = (isMobile = false) => {
    const buttonClass = isMobile
      ? "h-11 min-w-0 flex-1 rounded-xl px-3 text-xs"
      : "h-11 w-full rounded-xl text-sm";
    const outlineClass =
      "border-[#39403c] bg-transparent text-[#b8c0bb] hover:border-[#69746e] hover:bg-[#b5e3c4]/5 hover:text-[#f1f3ee]";

    if (isTraining && isPreContestPeriod) {
      return (
        <Button
          variant="outline"
          onClick={onStopTraining}
          className={cn(
            buttonClass,
            "border-[#e5a39d]/30 bg-transparent text-[#e5a39d] hover:bg-[#e5a39d]/10 hover:text-[#efbeb9]",
          )}
        >
          <XCircle className="size-4" />
          Cancel session
        </Button>
      );
    }

    if (isTraining) {
      return (
        <div
          className={cn(
            "space-y-3",
            isMobile && "flex w-full items-center gap-2 space-y-0",
          )}
        >
          {!isOnBreak && (
            <>
              <Button
                variant="outline"
                onClick={refreshProblemStatus}
                aria-label={
                  isRefreshing ? "Refreshing status" : "Refresh status"
                }
                className={cn(buttonClass, outlineClass)}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    isRefreshing && "animate-spin motion-reduce:animate-none",
                  )}
                />
                {isRefreshing
                  ? isMobile
                    ? "Checking…"
                    : "Refreshing…"
                  : isMobile
                    ? "Refresh"
                    : "Refresh status"}
              </Button>
              {!isMobile && (
                <p className="px-1 text-xs leading-relaxed text-[#929b98]">
                  Submitted on Codeforces? Refresh to see your latest result.
                </p>
              )}
              {!isMobile && onExtendEndTime && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowBreakPicker(!showBreakPicker)}
                    aria-expanded={showBreakPicker}
                    className={cn(buttonClass, outlineClass)}
                  >
                    <Coffee className="size-4" />
                    Take a break
                  </Button>
                  {renderBreakPicker()}
                </>
              )}
              <Button
                onClick={onFinishTraining}
                aria-label="Finish session"
                className={cn(
                  buttonClass,
                  "bg-[#b5e3c4] text-[#101214] hover:bg-[#ceedd8]",
                )}
              >
                <Trophy className="size-4" />
                {isMobile ? "Finish" : "Finish session"}
              </Button>
              {!isMobile && (
                <button
                  type="button"
                  onClick={onStopTraining}
                  className="flex min-h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-[#929b98] transition-colors hover:text-[#e5a39d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
                >
                  <Square className="size-3" />
                  Discard session
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
      <aside
        className="hidden w-full font-sans text-[#f1f3ee] lg:block"
        aria-label="Session controls"
      >
        <div className="sticky top-24 space-y-4">
          <m.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-6 rounded-2xl border border-[#2b3031] bg-[#15181a] p-6"
          >
            {isOnBreak ? (
              renderBreakBanner()
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-[#929b98]">
                  <Clock className="size-4" />
                  <span>
                    {isPreContestPeriod ? "Starting in" : "Time remaining"}
                  </span>
                </div>
                <CountDown
                  startTime={training.startTime}
                  endTime={training.endTime}
                />
              </div>
            )}
            <div className="border-t border-[#2b3031] pt-5">
              <div className="mb-3 flex items-center gap-2 text-xs text-[#929b98]">
                <Target className="size-4" />
                <span>Your progress</span>
              </div>
              <p className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-medium tracking-tight text-[#b5e3c4] tabular-nums">
                  {solvedCount}
                </span>
                <span className="text-sm text-[#929b98]">
                  / {totalCount} problems solved
                </span>
              </p>
            </div>
            <div className="border-t border-[#2b3031] pt-5">
              {renderActionButtons()}
            </div>
          </m.div>
          <p className="px-2 text-xs leading-relaxed text-[#929b98]">
            Every attempt is useful. Focus on your approach, then take time to
            review what you learned.
          </p>
        </div>
      </aside>

      <AnimatePresence>
        {isTraining && (
          <m.div
            className="fixed inset-x-0 bottom-0 z-40 font-sans text-[#f1f3ee] lg:hidden"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="m-3 max-h-[75dvh] overflow-y-auto rounded-2xl border border-[#39403c] bg-[#191c1e]/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              {isOnBreak ? (
                <div className="flex items-center gap-3">
                  <Coffee className="size-5 shrink-0 text-[#b5e3c4]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#929b98]">On a break</p>
                    <p className="font-heading text-2xl tabular-nums">
                      {breakMinutes}:{breakSeconds.toString().padStart(2, "0")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={endBreakEarly}
                    className="rounded-lg border-[#39403c] bg-transparent text-xs text-[#b5e3c4] hover:bg-[#b5e3c4]/10"
                  >
                    Resume
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {renderBreakPicker()}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="mb-1.5 text-xs text-[#929b98]">
                        {isPreContestPeriod ? "Starting in" : "Time remaining"}
                      </p>
                      <CountDown
                        startTime={training.startTime}
                        endTime={training.endTime}
                        compact
                      />
                    </div>
                    <div className="ml-auto text-right">
                      <p className="mb-1.5 text-xs text-[#929b98]">Solved</p>
                      <p className="font-heading text-2xl text-[#b5e3c4] tabular-nums">
                        {solvedCount}
                        <span className="ml-1 text-sm text-[#929b98]">
                          / {totalCount}
                        </span>
                      </p>
                    </div>
                    {!isPreContestPeriod && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="More session actions"
                        aria-expanded={showMobileActions}
                        aria-controls="mobile-session-actions"
                        onClick={() => setShowMobileActions(!showMobileActions)}
                        className="size-10 shrink-0 rounded-xl text-[#929b98]"
                      >
                        <MoreHorizontal className="size-5" />
                      </Button>
                    )}
                  </div>
                  {showMobileActions && !isPreContestPeriod && (
                    <div
                      id="mobile-session-actions"
                      className="flex gap-2 border-t border-[#2b3031] pt-3"
                    >
                      {onExtendEndTime && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBreakPicker(!showBreakPicker)}
                          aria-expanded={showBreakPicker}
                          className="flex-1 rounded-lg text-xs text-[#929b98]"
                        >
                          <Coffee className="size-4" />
                          Take a break
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onStopTraining}
                        className="flex-1 rounded-lg text-xs text-[#e5a39d]"
                      >
                        <Square className="size-4" />
                        Discard
                      </Button>
                    </div>
                  )}
                  {renderActionButtons(true)}
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TrainingControls;

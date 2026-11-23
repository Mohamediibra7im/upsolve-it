"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  Coffee,
  Play,
  RefreshCw,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CountDown from "../CountDown";
import { Training } from "@/types/Training";
import type { TrainingMode } from "@/types/TrainingMode";
import { cn } from "@/lib/utils";

const BREAK_OPTIONS = [5, 10, 15] as const;

const MODE_NAMES: Record<TrainingMode, string> = {
  ladder: "Ladder training",
  weakness: "Weakness training",
  speed: "Speed round",
  contest: "Contest simulation",
  endurance: "Endurance mode",
};

const pad = (n: number) => n.toString().padStart(2, "0");

interface TrainingControlsProps {
  training: Training;
  isPreContestPeriod: boolean;
  solvedCount: number;
  totalCount: number;
  isRefreshing: boolean;
  refreshProblemStatus: () => void;
  onFinishTraining: () => void;
  onStopTraining: () => void;
  onExtendEndTime: (minutes: number) => void;
}

/** The band across a live session: where you are, the clock, what you can do. */
const TrainingControls = ({
  training,
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

  const startBreak = (minutes: number) => {
    setBreakEndTime(Date.now() + minutes * 60000);
    onExtendEndTime(minutes);
  };

  const breakRemaining = isOnBreak
    ? Math.max(0, breakEndTime! - Date.now())
    : 0;
  const breakMinutes = Math.floor(breakRemaining / 60000);
  const breakSeconds = Math.floor((breakRemaining % 60000) / 1000);

  const state: {
    badge: "solved" | "pending";
    icon: LucideIcon;
    label: string;
  } = isPreContestPeriod
    ? { badge: "pending", icon: Clock, label: "Starting soon" }
    : isOnBreak
      ? { badge: "pending", icon: Coffee, label: "On a break" }
      : { badge: "solved", icon: Activity, label: "Session in progress" };

  return (
    <div className="grid items-center gap-6 px-5 py-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-7">
      <div className="grid justify-items-start gap-2">
        <Badge variant={state.badge}>
          <state.icon aria-hidden="true" />
          {state.label}
        </Badge>
        <h2 className="t-h2">
          {MODE_NAMES[training.trainingMode ?? "ladder"]}
        </h2>
        <p className="t-muted">
          {isPreContestPeriod ? (
            "Your problems open when the countdown ends."
          ) : isOnBreak ? (
            "The break is added to your session time."
          ) : (
            <>
              <span className="t-num">{solvedCount}</span> of{" "}
              <span className="t-num">{totalCount}</span> completed.{" "}
              {solvedCount === totalCount && totalCount > 0
                ? "Nicely done."
                : "Keep going."}
            </>
          )}
        </p>
      </div>

      <div className="grid justify-items-start gap-1.5 lg:justify-items-center">
        {isOnBreak ? (
          <>
            <span className="t-eyebrow">Break ends in</span>
            <span
              role="timer"
              aria-live="off"
              aria-label={`${breakMinutes} minutes, ${breakSeconds} seconds of break left`}
              className="u-timer"
            >
              {pad(breakMinutes)}
              <small>m</small>
              {pad(breakSeconds)}
              <small>s</small>
            </span>
          </>
        ) : (
          <CountDown
            startTime={training.startTime}
            endTime={training.endTime}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        {isPreContestPeriod ? (
          <Button variant="destructive" onClick={onStopTraining}>
            <X aria-hidden="true" />
            Cancel session
          </Button>
        ) : isOnBreak ? (
          <Button variant="outline" onClick={() => setBreakEndTime(null)}>
            <Play aria-hidden="true" />
            Resume session
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={refreshProblemStatus}
              disabled={isRefreshing}
            >
              <RefreshCw
                aria-hidden="true"
                className={cn(
                  isRefreshing && "animate-spin motion-reduce:animate-none",
                )}
              />
              {isRefreshing ? "Refreshing…" : "Refresh status"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Coffee aria-hidden="true" />
                  Take a break
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>How long would you like?</DropdownMenuLabel>
                {BREAK_OPTIONS.map((minutes) => (
                  <DropdownMenuItem
                    key={minutes}
                    onSelect={() => startBreak(minutes)}
                  >
                    <span className="t-num">{minutes}</span> min
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={onFinishTraining}>Finish session</Button>
            <Button
              variant="ghost"
              className="text-failed"
              onClick={onStopTraining}
            >
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingControls;

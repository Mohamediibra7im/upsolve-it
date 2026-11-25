"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  Coffee,
  Play,
  RefreshCw,
  Trash2,
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
import { breakBudgetLeftMs, breakLeftMs } from "@/services/training/breaks";

const BREAK_OPTIONS = [5, 10, 15] as const;
const REFRESH_REST_MS = 10_000;

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
  /** When the verdicts were last read from the judges. */
  lastCheckedAt?: number | null;
  onFinishTraining: () => void;
  onStopTraining: () => void;
  onStartBreak: (minutes: number) => void;
  onEndBreak: () => void;
  /** The clock and the actions alone, small, to sit in the workspace's bar. */
  compact?: boolean;
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
  onStartBreak,
  onEndBreak,
  lastCheckedAt,
  compact,
}: TrainingControlsProps) => {
  const [, setTick] = useState(0);
  const now = Date.now();
  const breakRemaining = breakLeftMs(training, now);
  const isOnBreak = breakRemaining > 0;
  const budgetLeft = breakBudgetLeftMs(training);

  // the break clock, and the moment the break runs out
  useEffect(() => {
    if (!isOnBreak) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isOnBreak]);

  // A judge allows only so many reads: after one by hand, the button rests.
  const [restUntil, setRestUntil] = useState(0);
  const resting = now < restUntil;
  useEffect(() => {
    if (!resting) return;
    const timer = setTimeout(() => setTick((t) => t + 1), restUntil - now + 50);
    return () => clearTimeout(timer);
  }, [resting, restUntil, now]);
  const refresh = () => {
    setRestUntil(Date.now() + REFRESH_REST_MS);
    refreshProblemStatus();
  };
  const checked = lastCheckedAt
    ? `Last checked ${Math.max(1, Math.round((now - lastCheckedAt) / 60000))} min ago.`
    : "Not checked yet.";
  const refreshHint = `Reads your verdicts from the judge. It also happens by itself when you come back to this tab. ${checked}`;

  const breakMinutes = Math.floor(breakRemaining / 60000);
  const breakSeconds = Math.floor((breakRemaining % 60000) / 1000);
  const breakMenu = (
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>
        {budgetLeft > 0
          ? `${Math.floor(budgetLeft / 60000)} min of break left`
          : "No break time left"}
      </DropdownMenuLabel>
      {BREAK_OPTIONS.map((minutes) => (
        <DropdownMenuItem
          key={minutes}
          disabled={minutes * 60000 > budgetLeft}
          onSelect={() => onStartBreak(minutes)}
        >
          <span className="t-num">{minutes}</span> min
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );

  const state: {
    badge: "solved" | "pending";
    icon: LucideIcon;
    label: string;
  } = isPreContestPeriod
    ? { badge: "pending", icon: Clock, label: "Starting soon" }
    : isOnBreak
      ? { badge: "pending", icon: Coffee, label: "On a break" }
      : { badge: "solved", icon: Activity, label: "Session in progress" };

  if (compact)
    return isOnBreak ? (
      <>
        <span
          role="timer"
          aria-live="off"
          aria-label={`${breakMinutes} minutes, ${breakSeconds} seconds of break left`}
          className="u-timer u-timer--sm"
          data-warn
        >
          {pad(breakMinutes)}
          <small>m</small>
          {pad(breakSeconds)}
          <small>s</small>
        </span>
        <Button variant="outline" size="sm" onClick={onEndBreak}>
          <Play aria-hidden="true" />
          Resume
        </Button>
      </>
    ) : (
      <>
        <CountDown
          compact
          startTime={training.startTime}
          endTime={training.endTime}
        />
        <Button
          variant="outline"
          size="sm"
          aria-label={isRefreshing ? "Refreshing status" : "Refresh status"}
          title={refreshHint}
          onClick={refresh}
          disabled={isRefreshing || resting}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn(
              isRefreshing && "animate-spin motion-reduce:animate-none",
            )}
          />
          <span className="max-2xl:hidden">
            {isRefreshing ? "Checking…" : "Refresh"}
          </span>
        </Button>
        {!training.roomCode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label="Take a break"
                title="Pause the clock for a few minutes. The problems are covered while you are away."
              >
                <Coffee aria-hidden="true" />
                <span className="max-2xl:hidden">Break</span>
              </Button>
            </DropdownMenuTrigger>
            {breakMenu}
          </DropdownMenu>
        )}
        <Button size="sm" onClick={onFinishTraining}>
          Finish
        </Button>
        {/* set apart from Finish, so the two are never confused */}
        <span className="mx-1 h-5 w-px bg-line-strong" aria-hidden="true" />
        <Button
          variant="destructive"
          size="sm"
          aria-label="Discard this session"
          title="Discard this session. Nothing from it is saved."
          onClick={onStopTraining}
        >
          <Trash2 aria-hidden="true" />
          <span className="max-2xl:hidden">Discard</span>
        </Button>
      </>
    );

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
          <Button variant="outline" onClick={onEndBreak}>
            <Play aria-hidden="true" />
            Resume session
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              title={refreshHint}
              onClick={refresh}
              disabled={isRefreshing || resting}
            >
              <RefreshCw
                aria-hidden="true"
                className={cn(
                  isRefreshing && "animate-spin motion-reduce:animate-none",
                )}
              />
              {isRefreshing ? "Refreshing…" : "Refresh status"}
            </Button>
            {!training.roomCode && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Coffee aria-hidden="true" />
                    Take a break
                  </Button>
                </DropdownMenuTrigger>
                {breakMenu}
              </DropdownMenu>
            )}
            <Button onClick={onFinishTraining}>Finish session</Button>
            <Button variant="destructive" onClick={onStopTraining}>
              <Trash2 aria-hidden="true" />
              Discard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TrainingControls;

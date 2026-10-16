"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useLevels } from "@/hooks/roadmap";
import { useUser } from "@/hooks/auth";

interface LevelSelectorProps {
  onLevelChange: (ratings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => void;
  currentRatings: { P1: number; P2: number; P3: number; P4: number };
  showRatings: boolean;
  setShowRatings: React.Dispatch<React.SetStateAction<boolean>>;
}

const LevelSelector = ({
  onLevelChange,
  currentRatings,
  showRatings,
  setShowRatings,
}: LevelSelectorProps) => {
  const { levels, isLoading, getDefaultLevel, getLevelByPerformance } =
    useLevels();
  const { user } = useUser();

  const sortedLevels = useMemo(
    () => [...levels].sort((a, b) => a.id - b.id),
    [levels],
  );

  const matchIdFromRatings = useMemo(() => {
    if (sortedLevels.length === 0) return 1;
    const same = sortedLevels.filter(
      (level) =>
        Number.parseInt(level.P1, 10) === currentRatings.P1 &&
        Number.parseInt(level.P2, 10) === currentRatings.P2 &&
        Number.parseInt(level.P3, 10) === currentRatings.P3 &&
        Number.parseInt(level.P4, 10) === currentRatings.P4,
    );
    if (same.length === 0) return sortedLevels[0].id;
    if (same.length === 1) return same[0].id;
    const best = same.reduce((a, b) =>
      Number.parseInt(a.Performance, 10) >= Number.parseInt(b.Performance, 10)
        ? a
        : b,
    );
    return best.id;
  }, [sortedLevels, currentRatings]);

  const [pendingLevelId, setPendingLevelId] = useState<number | null>(null);
  const [prevMatchId, setPrevMatchId] = useState<number | null>(
    matchIdFromRatings,
  );

  if (matchIdFromRatings !== prevMatchId) {
    setPrevMatchId(matchIdFromRatings);
    setPendingLevelId(null);
  }

  if (
    pendingLevelId !== null &&
    !sortedLevels.some((l) => l.id === pendingLevelId)
  ) {
    setPendingLevelId(null);
  }

  const activeLevelId = pendingLevelId ?? matchIdFromRatings;

  const maxLevelId = useMemo(
    () => sortedLevels.reduce((m, l) => Math.max(m, l.id), 0),
    [sortedLevels],
  );

  const applyLevelId = (levelId: number) => {
    const level = sortedLevels.find((l) => l.id === levelId);
    if (!level) return;
    setPendingLevelId(levelId);
    onLevelChange({
      P1: Number.parseInt(level.P1, 10),
      P2: Number.parseInt(level.P2, 10),
      P3: Number.parseInt(level.P3, 10),
      P4: Number.parseInt(level.P4, 10),
    });
  };

  const selectedIndex = sortedLevels.findIndex((l) => l.id === activeLevelId);

  const increaseLevel = () => {
    if (selectedIndex >= 0 && selectedIndex < sortedLevels.length - 1) {
      const next = sortedLevels[selectedIndex + 1];
      applyLevelId(next.id);
    }
  };

  const decreaseLevel = () => {
    if (selectedIndex > 0) {
      const prev = sortedLevels[selectedIndex - 1];
      applyLevelId(prev.id);
    }
  };

  const resetToDefault = () => {
    if (user?.rating) {
      const userLevel = getLevelByPerformance(user.rating);
      if (userLevel) applyLevelId(userLevel.id);
    } else {
      const defaultLevel = getDefaultLevel();
      if (defaultLevel) applyLevelId(defaultLevel.id);
    }
  };

  const currentLevel = sortedLevels.find((level) => level.id === activeLevelId);

  useEffect(() => {
    if (!currentLevel) return;
    onLevelChange({
      P1: Number.parseInt(currentLevel.P1, 10),
      P2: Number.parseInt(currentLevel.P2, 10),
      P3: Number.parseInt(currentLevel.P3, 10),
      P4: Number.parseInt(currentLevel.P4, 10),
    });
  }, [currentLevel, onLevelChange]);

  const levelPercent = maxLevelId > 0 ? (activeLevelId / maxLevelId) * 100 : 0;
  const recommendedLevel = user?.rating
    ? getLevelByPerformance(user.rating)?.id
    : 1;

  if (isLoading) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[#2b3031] bg-[#15181a] p-8 text-sm text-[#929b98]"
      >
        Loading your training levels…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#929b98]">
          A little challenge goes a long way.
        </p>
        <button
          type="button"
          aria-pressed={showRatings}
          onClick={() => setShowRatings((prev) => !prev)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-[#b5e3c4] transition-colors hover:bg-[#b5e3c4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
        >
          {showRatings ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
          {showRatings ? "Hide ratings" : "Show ratings"}
        </button>
      </div>

      <div className="rounded-2xl border border-[#2b3031] bg-[#15181a] p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#929b98]">Training level</p>
            <p className="mt-1 whitespace-nowrap font-heading text-4xl sm:text-5xl font-medium tracking-tight text-[#f1f3ee] tabular-nums">
              {activeLevelId}
              <span className="ml-1 text-sm font-normal tracking-normal text-[#929b98]">
                / {maxLevelId || levels.length}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Decrease training level"
              onClick={decreaseLevel}
              disabled={selectedIndex <= 0}
              className="flex size-9 sm:size-11 items-center justify-center rounded-xl border border-[#39403c] text-[#f1f3ee] transition-colors hover:border-[#b5e3c4] hover:bg-[#b5e3c4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Minus className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Increase training level"
              onClick={increaseLevel}
              disabled={
                selectedIndex < 0 || selectedIndex >= sortedLevels.length - 1
              }
              className="flex size-9 sm:size-11 items-center justify-center rounded-xl border border-[#39403c] text-[#f1f3ee] transition-colors hover:border-[#b5e3c4] hover:bg-[#b5e3c4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div
          className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#2b3031]"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-[#b5e3c4] transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${levelPercent}%` }}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-between gap-2 text-xs text-[#929b98]">
          <span>
            Target performance{" "}
            <span className="ml-1 font-medium text-[#f1f3ee] tabular-nums">
              {currentLevel?.Performance || "900"}
            </span>
          </span>
          <span>
            Level time{" "}
            <span className="ml-1 font-medium text-[#f1f3ee] tabular-nums">
              {currentLevel?.time || "120"} min
            </span>
          </span>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-[#929b98]">
          <span>Problem difficulty</span>
          <span>{showRatings ? "Ratings visible" : "Ratings hidden"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {[
            currentLevel?.P1,
            currentLevel?.P2,
            currentLevel?.P3,
            currentLevel?.P4,
          ].map((rating, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#2b3031] p-3 sm:p-4"
            >
              <p className="text-xs text-[#929b98]">
                {String.fromCharCode(65 + index)}
              </p>
              <p className="mt-3 text-base font-medium text-[#f1f3ee] tabular-nums">
                {showRatings ? (
                  rating
                ) : (
                  <span aria-label="Rating hidden" className="text-[#69746e]">
                    —
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#2b3031] pt-4">
        <button
          type="button"
          onClick={resetToDefault}
          className="inline-flex min-h-9 items-center gap-2 rounded-lg text-xs font-medium text-[#b5e3c4] transition-colors hover:text-[#d2eedb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] focus-visible:ring-offset-4 focus-visible:ring-offset-[#191c1e]"
        >
          <RotateCcw className="size-3.5" />
          Use recommended level
        </button>
        <span className="text-xs text-[#929b98]">
          Level {recommendedLevel ?? 1} for your rating
        </span>
      </div>
    </div>
  );
};

export default LevelSelector;

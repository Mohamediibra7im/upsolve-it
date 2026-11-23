"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useLevels, type Level } from "@/hooks/training";
import { useUser } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { Bar } from "@/components/ui/kit";

interface LevelSelectorProps {
  onLevelChange: (level: Level) => void;
  currentRatings: { P1: number; P2: number; P3: number; P4: number };
  /** Shown in place of the stepper when the mode does not use the level. */
  note?: string;
}

const LevelSelector = ({
  onLevelChange,
  currentRatings,
  note,
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
    onLevelChange(level);
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
    if (currentLevel) onLevelChange(currentLevel);
  }, [currentLevel, onLevelChange]);

  const levelPercent = maxLevelId > 0 ? (activeLevelId / maxLevelId) * 100 : 0;

  if (note) return <p className="t-sm t-muted">{note}</p>;

  if (isLoading) {
    return (
      <p role="status" className="t-muted">
        Loading your training levels…
      </p>
    );
  }

  if (!currentLevel) {
    return (
      <p role="alert" className="t-muted">
        The training levels did not load. Reload the page to try again.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="u-btn--sm"
          aria-label="Lower level"
          onClick={decreaseLevel}
          disabled={selectedIndex <= 0}
        >
          <Minus />
        </Button>
        <span className="t-num-lg whitespace-nowrap text-[22px]">
          Level {activeLevelId}
          <span className="t-muted text-[0.6em]"> / {maxLevelId}</span>
        </span>
        <Button
          variant="outline"
          size="icon"
          className="u-btn--sm"
          aria-label="Higher level"
          onClick={increaseLevel}
          disabled={selectedIndex >= sortedLevels.length - 1}
        >
          <Plus />
        </Button>
      </div>
      <Bar
        value={levelPercent}
        label="Training level"
        className="min-w-10 flex-1"
      />
      <button
        type="button"
        onClick={resetToDefault}
        className="u-btn u-btn--sm"
      >
        Use recommended level
      </button>
    </div>
  );
};

export default LevelSelector;

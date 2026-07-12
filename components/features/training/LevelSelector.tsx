"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, RotateCcw, Trophy, Target, Zap } from "lucide-react";
import { useLevels } from "@/hooks/roadmap";
import { useUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";

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
  const { levels, isLoading, getDefaultLevel, getLevelByPerformance } = useLevels();
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
  const [prevMatchId, setPrevMatchId] = useState<number | null>(matchIdFromRatings);

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

  const getProblemDifficultyColor = (rating: number) => {
    if (rating < 1200) return "text-slate-400 border-slate-500/20";
    if (rating < 1400) return "text-green-400 border-green-500/20";
    if (rating < 1600) return "text-cyan-400 border-cyan-500/20";
    if (rating < 1900) return "text-blue-400 border-blue-500/20";
    if (rating < 2100) return "text-purple-400 border-purple-500/20";
    if (rating < 2300) return "text-amber-400 border-amber-500/20";
    if (rating < 2400) return "text-orange-400 border-orange-500/20";
    return "text-red-400 border-red-500/20";
  };

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

  // Block loading
  const totalBlocks = 18;
  const levelPercent = maxLevelId > 0 ? (activeLevelId / maxLevelId) * 100 : 0;
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((levelPercent / 100) * totalBlocks)));
  const emptyBlocks = totalBlocks - filledBlocks;
  const levelBlocks = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  if (isLoading) {
    return (
      <div className="border border-emerald-500/15 bg-transparent p-8 text-center animate-pulse font-mono text-emerald-500/40">
        [SYS] SECURING ROADMAP DIFFICULTY LEVELS... STANDBY
      </div>
    );
  }

  return (
    <div className="font-mono text-emerald-400 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-emerald-400" />
          <span className="font-semibold tracking-wider">SYS.LEVELS // CONFIG_DIFFICULTY</span>
        </div>

        <Button
          onClick={() => setShowRatings((prev) => !prev)}
          variant="outline"
          className="h-8 px-3 rounded border border-emerald-500/35 bg-[#060a08] text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 active:scale-[0.98] transition-all font-mono"
        >
          <Target size={11} className="mr-1.5" />
          {showRatings ? "[ MASK RATING ]" : "[ REVEAL RATING ]"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Adjuster block (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative bg-[#060a08]/50 border border-emerald-500/15 rounded-xl p-6 text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none z-10 bg-terminal-scanlines opacity-[0.06]" />
            <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-500/40 uppercase">TELEMETRY_LEVEL</div>
            <div className="text-6xl font-black text-emerald-300 glow-text-emerald leading-none py-2 tabular-nums">
              LVL_{activeLevelId}
            </div>
            
            <div className="flex items-center justify-center gap-6 pt-2 text-[10px] border-t border-emerald-500/10">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-emerald-500/40 uppercase">TARGET PERFORMANCE</span>
                <span className="text-sm font-bold text-emerald-300 mt-0.5 tabular-nums">{currentLevel?.Performance || "900"}</span>
              </div>
              <div className="w-px h-6 bg-emerald-500/15" />
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-emerald-500/40 uppercase">TIMEOUT PARAM</span>
                <span className="text-sm font-bold text-emerald-300 mt-0.5 tabular-nums">{currentLevel?.time || "120"} MIN</span>
              </div>
            </div>
          </div>

          {/* Level adjustment slider wrapper */}
          <div className="flex items-center justify-between gap-4 p-3 bg-emerald-950/5 rounded-xl border border-emerald-500/15 font-mono">
            <Button
              onClick={decreaseLevel}
              disabled={selectedIndex <= 0}
              variant="outline"
              className="h-10 px-3 rounded border border-emerald-500/35 bg-transparent text-emerald-400 font-bold uppercase hover:bg-emerald-500/10 disabled:opacity-20 transition-all font-mono"
            >
              <ChevronDown className="size-4" />
            </Button>

            <div className="text-center flex-1">
              <div className="text-[8px] font-black uppercase tracking-[0.25em] text-emerald-500/40 mb-1.5">SCALE DIFFICULTY</div>
              <div className="text-[9px] tracking-tight font-mono text-emerald-300 select-none">
                [{levelBlocks}] {Math.round(levelPercent)}%
              </div>
            </div>

            <Button
              onClick={increaseLevel}
              disabled={
                selectedIndex < 0 ||
                selectedIndex >= sortedLevels.length - 1
              }
              variant="outline"
              className="h-10 px-3 rounded border border-emerald-500/35 bg-transparent text-emerald-400 font-bold uppercase hover:bg-emerald-500/10 disabled:opacity-20 transition-all font-mono"
            >
              <ChevronUp className="size-4" />
            </Button>
          </div>
        </div>

        {/* Right Difficulty breakdown (col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="size-3 text-emerald-400 animate-pulse" />
            DIFFICULTY_NODES_TELEMETRY
          </span>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "PROBLEM_NODE_01", rating: currentLevel?.P1, style: getProblemDifficultyColor(Number.parseInt(currentLevel?.P1 || "0")) },
              { label: "PROBLEM_NODE_02", rating: currentLevel?.P2, style: getProblemDifficultyColor(Number.parseInt(currentLevel?.P2 || "0")) },
              { label: "PROBLEM_NODE_03", rating: currentLevel?.P3, style: getProblemDifficultyColor(Number.parseInt(currentLevel?.P3 || "0")) },
              { label: "PROBLEM_NODE_04", rating: currentLevel?.P4, style: getProblemDifficultyColor(Number.parseInt(currentLevel?.P4 || "0")) }
            ].map((p) => (
              <div
                key={p.label}
                className={cn(
                  "relative p-4 rounded-xl border bg-emerald-950/5 font-mono flex flex-col justify-between",
                  p.style
                )}
              >
                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest opacity-60">
                  <span>{p.label}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                </div>
                
                <div className="mt-2.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40 block">difficulty rating</span>
                  <div className="relative h-6 mt-0.5">
                    <div className={cn("text-base font-black tabular-nums transition-all leading-none", showRatings ? "" : "blur-md opacity-15")}>
                      {p.rating}
                    </div>
                    {!showRatings && (
                      <div className="absolute inset-0 flex items-center text-[9px] font-black text-emerald-500/30 uppercase tracking-widest">
                        [ HIDDEN ]
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer defaults block */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-emerald-500/10">
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefault}
            className="h-8 px-3 rounded border border-emerald-500/20 bg-transparent text-emerald-500 hover:text-emerald-300 hover:border-emerald-500/50 transition-all font-mono text-[9px] font-bold uppercase flex items-center gap-1.5"
          >
            <RotateCcw className="size-3" />
            [ RESET_RECOMMENDED ]
          </button>
          <span className="text-[9px] text-emerald-500/50">
            Reset to rating recommended level: {user?.rating ? `LVL_${getLevelByPerformance(user.rating)?.id}` : "LVL_1"}
          </span>
        </div>

        <div className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-[0.1em] px-2 py-0.5 rounded border border-emerald-500/10 bg-emerald-950/10">
          LEVEL RANGE: 1 - {maxLevelId || levels.length}
        </div>
      </div>
    </div>
  );
};

export default LevelSelector;

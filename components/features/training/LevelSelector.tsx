"use client";

import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp, ChevronDown, RotateCcw, Trophy, Target, Zap } from "lucide-react";
import { useLevels } from "@/hooks/roadmap";
import {useUser} from "@/hooks/auth";

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

  /**
   * Map props to a level id. When several rows share the same P1–P4 (possible with the
   * ladder formula), prefer the highest target Performance so we do not stick on an
   * earlier duplicate row (e.g. cannot leave level 4).
   */
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

  // Helper function to get problem difficulty color
  const getProblemDifficultyColor = (rating: number) => {
    if (rating < 1200) return "from-slate-400 to-slate-600"; // Newbie
    if (rating < 1400) return "from-emerald-400 to-emerald-600"; // Pupil
    if (rating < 1600) return "from-cyan-400 to-cyan-600"; // Specialist
    if (rating < 1900) return "from-indigo-400 to-indigo-600"; // Expert
    if (rating < 2100) return "from-violet-400 to-violet-600"; // CM
    if (rating < 2300) return "from-amber-400 to-amber-600"; // Master
    if (rating < 2400) return "from-orange-500 to-orange-700"; // IM
    return "from-rose-500 to-rose-700"; // LGM/GM
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

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/30 backdrop-blur-xl animate-pulse">
        <CardContent className="p-12 space-y-8">
          <div className="h-10 w-64 bg-muted rounded-full mx-auto" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-muted rounded-2xl" />
            <div className="h-24 bg-muted rounded-2xl" />
          </div>
          <div className="h-32 bg-muted rounded-3xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/5">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <CardHeader className="p-6 sm:p-8 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
              <Trophy className="size-8 text-primary" />
              Training Level
            </CardTitle>
            <p className="text-sm text-muted-foreground">Adjust the problem set difficulty to match your goals.</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRatings((prev) => !prev)}
            className="h-10 px-4 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
          >
            <Target className="size-4 mr-2" />
            {showRatings ? "Hide Probabilities" : "Show Probabilities"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8 lg:p-10 space-y-10 sm:space-y-12">
        {/* Main Display */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Level Info */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative bg-background/60 border border-primary/20 rounded-3xl p-8 text-center space-y-4 backdrop-blur-md shadow-inner">
                <div className="text-sm font-bold tracking-[0.2em] text-primary uppercase">Current Level</div>
                <div className="text-6xl sm:text-7xl font-black text-foreground tabular-nums tracking-tighter">
                  {currentLevel?.level || "1"}
                </div>
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Target Rating</span>
                    <span className="text-lg font-bold text-foreground">{currentLevel?.Performance || "900"}</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Limit</span>
                    <span className="text-lg font-bold text-foreground">{currentLevel?.time || "120"}m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 p-2 bg-muted/20 rounded-[2rem] border border-border/40 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={decreaseLevel}
                disabled={selectedIndex <= 0}
                className="size-14 rounded-full hover:bg-background shadow-none hover:shadow-xl transition-all duration-300 disabled:opacity-20"
              >
                <ChevronDown className="size-6" />
              </Button>

              <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Scale Level</div>
                <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden">
                  <m.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        maxLevelId > 0
                          ? (activeLevelId / maxLevelId) * 100
                          : 0
                      }%`,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={increaseLevel}
                disabled={
                  selectedIndex < 0 ||
                  selectedIndex >= sortedLevels.length - 1
                }
                className="size-14 rounded-full hover:bg-background shadow-none hover:shadow-xl transition-all duration-300 disabled:opacity-20"
              >
                <ChevronUp className="size-6" />
              </Button>
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Zap className="size-4 text-accent" />
              Difficulty Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Problem 1", rating: currentLevel?.P1, color: getProblemDifficultyColor(Number.parseInt(currentLevel?.P1 || "0")) },
                { label: "Problem 2", rating: currentLevel?.P2, color: getProblemDifficultyColor(Number.parseInt(currentLevel?.P2 || "0")) },
                { label: "Problem 3", rating: currentLevel?.P3, color: getProblemDifficultyColor(Number.parseInt(currentLevel?.P3 || "0")) },
                { label: "Problem 4", rating: currentLevel?.P4, color: getProblemDifficultyColor(Number.parseInt(currentLevel?.P4 || "0")) }
              ].map((p) => (
                <div key={p.label} className="group relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-[0.03] rounded-2xl group-hover:opacity-[0.08] transition-opacity duration-300`} />
                  <div className="relative p-5 rounded-2xl border border-border/40 bg-background/40 hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{p.label}</span>
                      <div className={`size-1.5 rounded-full bg-gradient-to-r ${p.color} animate-pulse`} />
                    </div>
                    <div className="relative h-8">
                      <div className={`text-xl font-black tabular-nums transition-all duration-500 ${showRatings ? "" : "blur-md opacity-20"}`}>
                        {p.rating}
                      </div>
                      {!showRatings && (
                        <div className="absolute inset-0 flex items-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                          Hidden
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/30 border border-border/40">
              <RotateCcw className="size-4 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Restore Defaults</div>
              <button
                onClick={resetToDefault}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                Reset to {user?.rating ? "Recommended" : "Level 1"}
              </button>
            </div>
          </div>

          <div className="px-4 py-1.5 rounded-full bg-muted/30 border border-border/40 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
              Level Range: 1 - {maxLevelId || levels.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelSelector;








"use client";

import { useMemo } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import {
  Layers,
  Check,
  Target,
  Lock,
  Trophy,
  Cpu,
} from "lucide-react";
import { useRoadmapLevels } from "@/hooks/roadmap/useRoadmap";
import { cn } from "@/lib/utils";

const RoadmapPage = () => {
  const { levels, isLoading } = useRoadmapLevels();

  const totals = useMemo(() => ({
    levelsCount: levels.length,
    totalTopics: levels.reduce((a, l) => a + (l.topicsCount ?? 0), 0),
    completedTopics: levels.reduce((a, l) => a + (l.topicsUnlockedCount ?? 0), 0),
    completedLevels: levels.filter(
      (l) => l.topicsCount > 0 && l.topicsUnlockedCount === l.topicsCount
    ).length,
  }), [levels]);

  const levelsWithStatus = useMemo(() => {
    const result: (typeof levels[number] & { isUnlocked: boolean; isComplete: boolean; progressPct: number })[] = [];
    for (let index = 0; index < levels.length; index++) {
      const level = levels[index];
      const prev = index > 0 ? result[index - 1] : null;
      const prevComplete = prev
        ? prev.isUnlocked && prev.topicsCount > 0 && prev.topicsUnlockedCount === prev.topicsCount
        : true;
      const isUnlocked = index === 0 || prevComplete || (level.isGranted ?? false);
      const isComplete = level.topicsCount > 0 && level.topicsUnlockedCount === level.topicsCount;
      const progressPct = level.topicsCount
        ? Math.min(100, Math.round((level.topicsUnlockedCount / level.topicsCount) * 100))
        : 0;
      result.push({ ...level, isUnlocked, isComplete, progressPct });
    }
    return result;
  }, [levels]);

  const overallPct = totals.totalTopics
    ? Math.round((totals.completedTopics / totals.totalTopics) * 100)
    : 0;

  // Progress blocks calculation
  const totalBlocks = 20;
  const progressBlocks = Math.min(totalBlocks, Math.round((overallPct / 100) * totalBlocks));

  return (
    <div className="min-h-screen pb-20 relative font-mono text-emerald-400">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-8 space-y-4"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Layers size={12} className="text-emerald-400" />
            <span>LEARNING_ROADMAP // MASTERY_TRAJECTORY</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>SYS.OK</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Roadmap Mastery Path
              </h1>
              <p className="text-[11px] text-emerald-500/40 max-w-md leading-relaxed">
                Work through structured levels in sequence. Complete materials, resolve practices, and unlock higher sector parameters.
              </p>
            </div>

            {/* Overall progress indicator */}
            <div className="shrink-0 space-y-2 text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">OVERALL_COMPILATION</span>
              <div className="flex items-center justify-end gap-3 text-xs">
                <span className="flex items-center">
                  <span className="text-emerald-500/30">[</span>
                  <span className="text-emerald-400">{"█".repeat(progressBlocks)}</span>
                  <span className="text-emerald-500/15">{"░".repeat(totalBlocks - progressBlocks)}</span>
                  <span className="text-emerald-500/30">]</span>
                </span>
                <span className="font-bold text-emerald-300">{overallPct}%</span>
              </div>
              <div className="flex items-center justify-end gap-3 text-[9px] text-emerald-500/30">
                <span>LEVELS: {totals.completedLevels}/{totals.levelsCount}</span>
                <span>•</span>
                <span>TOPICS: {totals.completedTopics}/{totals.totalTopics}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level List */}
        <div className="space-y-4 pt-4">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded border border-emerald-500/10 bg-emerald-950/5" />
              ))}
            </div>
          )}

          {levelsWithStatus.map((level, index) => {
            const { isUnlocked, isComplete, progressPct } = level;
            const levelBlocks = Math.min(10, Math.round((progressPct / 100) * 10));

            return (
              <motion.div
                key={level._id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="space-y-4"
              >
                <div className={cn(
                  "relative overflow-hidden rounded-lg border",
                  isComplete
                    ? "border-emerald-500/25 bg-emerald-950/[0.02]"
                    : isUnlocked
                      ? "border-emerald-500/15 bg-emerald-950/[0.01]"
                      : "border-emerald-500/5 bg-[#040604]/50 opacity-50"
                )}>
                  {/* Status header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-[#081210]">
                    <div className="flex items-center gap-1.5 text-[8px] font-bold tracking-wider text-emerald-400/55">
                      {isComplete ? <Check size={10} /> : isUnlocked ? <Target size={10} /> : <Lock size={10} />}
                      <span>LEVEL_STATION_{String(index + 1).padStart(2, "0")}{" // "}{level.title.toUpperCase()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                        isComplete
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : isUnlocked
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-emerald-500/5 border-emerald-500/5 text-emerald-500/20"
                      )}>
                        {isComplete ? "COMPLETE" : isUnlocked ? "IN_PROGRESS" : "LOCKED"}
                      </span>
                      <span className="text-[7px] font-bold text-emerald-500/30 uppercase">
                        +{level.levelBonusXp ?? 500} XP
                      </span>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {level.description && (
                        <p className="text-[11px] text-emerald-500/50 leading-relaxed truncate max-w-xl">
                          {level.description}
                        </p>
                      )}

                      {/* Progress Readout */}
                      <div className="flex items-center gap-3 text-[9px] text-emerald-500/40">
                        <span className="tabular-nums flex items-center">
                          <span className="text-emerald-500/30">[</span>
                          <span className="text-emerald-400">{"█".repeat(levelBlocks)}</span>
                          <span className="text-emerald-500/15">{"░".repeat(10 - levelBlocks)}</span>
                          <span className="text-emerald-500/30">]</span>
                        </span>
                        <span>{level.topicsUnlockedCount}/{level.topicsCount} TOPICS</span>
                        <span>•</span>
                        <span className="tabular-nums text-emerald-300">{progressPct}%</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0">
                      {isUnlocked ? (
                        <Link
                          href={`/roadmap/levels/${level._id}`}
                          className={cn(
                            "h-9 px-4 rounded border font-bold uppercase tracking-widest text-[9px] transition-all inline-flex items-center justify-center font-mono",
                            isComplete
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15"
                              : "bg-emerald-500 text-emerald-950 border-emerald-500 hover:bg-emerald-400"
                          )}
                        >
                          {isComplete ? "[ REVIEW_RUN.EXE ]" : "[ CONTINUE_RUN.EXE ]"}
                        </Link>
                      ) : (
                        <span className="h-9 px-4 rounded border border-emerald-500/5 text-emerald-500/20 text-[9px] font-bold uppercase tracking-widest inline-flex items-center justify-center select-none cursor-not-allowed">
                          [ LOCKED.SYS ]
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connector line */}
                {index < levelsWithStatus.length - 1 && (
                  <div className="flex items-center justify-center h-4 pointer-events-none">
                    <div className={cn(
                      "w-px h-full",
                      isComplete ? "bg-emerald-500/30" : "bg-emerald-500/10"
                    )} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* End Trophy Node */}
          {levelsWithStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center pt-6 gap-3"
            >
              <div className="flex items-center justify-center h-4">
                <div className="w-px h-full bg-emerald-500/10" />
              </div>
              <div className={cn(
                "size-12 rounded border flex items-center justify-center transition-all duration-300",
                totals.completedLevels === totals.levelsCount && totals.levelsCount > 0
                  ? "bg-amber-500/10 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-emerald-500/5 border-emerald-500/10"
              )}>
                <Trophy size={18} className={totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "text-amber-400" : "text-emerald-500/20"} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/30 text-center">
                {totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "Roadmap Sequence Fully Mastered" : "Resolve all level stations to compile final sequence"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

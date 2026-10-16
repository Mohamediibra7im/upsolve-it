"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import StudioMascot from "@/components/shared/StudioMascot";
import StudioProgress from "@/components/features/profile/StudioProgress";
import { useMemo } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import {
  Layers,
  Check,
  Target,
  Lock,
  Trophy,
} from "lucide-react";
import { useRoadmapLevels } from "@/hooks/roadmap/useRoadmap";
import { cn } from "@/lib/utils";

const RoadmapPage = () => {
  const { levels, isLoading, error, mutateLevels } = useRoadmapLevels();

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


  return (
    <div className="min-h-screen pb-20 relative font-sans text-foreground">
      {/* Background */}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-start gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Header Section */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-7 lg:sticky lg:top-24"
        >
          <StudioMascot pose="climb" className="w-28 sm:w-36" />
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers size={12} className="text-primary" />
            <span>Your learning roadmap</span>
            <span className="flex-1 border-b border-border" />
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-1">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                Build your next chapter.
              </h1>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Build your understanding step by step. Learn a concept, put it into practice, and unlock what comes next.
              </p>
            </div>

            {/* Overall progress indicator */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <span className="text-xs font-medium text-muted-foreground">Overall progress</span>
              <div className="flex items-center gap-3 text-xs">
                <StudioProgress value={overallPct} className="w-24 sm:w-32" />
                <span className="font-medium text-foreground">{overallPct}%</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Levels: {totals.completedLevels}/{totals.levelsCount}</span>
                <span>•</span>
                <span>Topics: {totals.completedTopics}/{totals.totalTopics}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level List */}
        <div className="space-y-5">
          {error && levels.length === 0 && <MemberPageState kind="error" title="Your roadmap is unavailable" description="We couldn’t load the curriculum. Try again in a moment."><Button variant="outline" onClick={() => mutateLevels()}>Try again</Button></MemberPageState>}
          {!isLoading && !error && levels.length === 0 && <MemberPageState title="A new path is taking shape" description="The curriculum is being prepared. Check back soon, or keep practicing with a training session."><Button asChild><Link href="/training">Start training</Link></Button></MemberPageState>}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse motion-reduce:animate-none rounded-2xl border border-border bg-card" />
              ))}
            </div>
          )}

          {levelsWithStatus.map((level, index) => {
            const { isUnlocked, isComplete, progressPct } = level;


            return (
              <motion.div
                key={level._id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="space-y-4"
              >
                <div className={cn(
                  "relative overflow-hidden rounded-2xl border",
                  isComplete
                    ? "border-border bg-card"
                    : isUnlocked
                      ? "border-border bg-card"
                      : "border-border bg-background"
                )}>
                  {/* Status header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-border bg-card">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      {isComplete ? <Check size={10} /> : isUnlocked ? <Target size={10} /> : <Lock size={10} />}
                      <span>Level {String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-lg border",
                        isComplete
                          ? "bg-primary/10 border-border text-primary"
                          : isUnlocked
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-primary/10 border-border text-muted-foreground"
                      )}>
                        {isComplete ? "Complete" : isUnlocked ? "In progress" : "Locked"}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        +{level.levelBonusXp ?? 500} XP
                      </span>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="space-y-2.5 flex-1 min-w-0">
                      <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">{level.title}</h2>
                      {level.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                          {level.description}
                        </p>
                      )}

                      {/* Progress Readout */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <StudioProgress value={progressPct} className="w-24 sm:w-32" />
                        <span>{level.topicsUnlockedCount}/{level.topicsCount} topics</span>
                        <span>•</span>
                        <span className="tabular-nums text-foreground">{progressPct}%</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0">
                      {isUnlocked ? (
                        <Link
                          href={`/roadmap/levels/${level._id}`}
                          className={cn(
                            "h-9 px-4 rounded-lg border font-medium text-xs transition-all inline-flex items-center justify-center font-sans",
                            isComplete
                              ? "bg-primary/10 border-border text-primary hover:bg-primary/10"
                              : "bg-primary text-primary-foreground border-border hover:bg-primary"
                          )}
                        >
                          {isComplete ? "Review level" : "Continue learning"}
                        </Link>
                      ) : (
                        <span className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-xs font-medium inline-flex items-center justify-center cursor-not-allowed">
                          Locked
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
                      isComplete ? "bg-primary/10" : "bg-primary/10"
                    )} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* End Trophy Node */}
          {levelsWithStatus.length > 0 && (
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col items-center pt-6 gap-3"
            >
              <div className="flex items-center justify-center h-4">
                <div className="w-px h-full bg-primary/10" />
              </div>
              <div className={cn(
                "size-12 rounded-lg border flex items-center justify-center transition-all duration-300",
                totals.completedLevels === totals.levelsCount && totals.levelsCount > 0
                  ? "bg-amber-500/10 border-amber-500/25"
                  : "bg-primary/10 border-border"
              )}>
                <Trophy size={18} className={totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "text-amber-400" : "text-muted-foreground"} />
              </div>
              <p className="text-xs font-medium text-muted-foreground text-center">
                {totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "You’ve completed the roadmap." : "One topic at a time. Keep building your understanding."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

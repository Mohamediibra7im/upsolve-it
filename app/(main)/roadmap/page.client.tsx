"use client";

import { useMemo } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import {
  Compass,
  Layers,
  Check,
  Target,
  ChevronRight,
  Lock,
  Zap,
  BookOpen,
  Trophy,
  ArrowRight,
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

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Fixed background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(var(--primary),0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="fixed top-0 right-1/4 size-[700px] rounded-full bg-primary/4 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 size-[500px] rounded-full bg-emerald-500/3 blur-[140px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 pb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            {/* Left */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em]">
                <Compass size={12} /> Learning Roadmap
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-none text-foreground">
                  Your Path to<br />
                  <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Mastery
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground/70 max-w-lg leading-relaxed">
                  Work through structured levels. Complete learning materials, solve practice problems, and unlock the next stage.
                </p>
              </div>
            </div>

            {/* Right: overall progress ring */}
            <div className="shrink-0 flex items-center gap-6">
              <div className="relative size-28">
                <svg viewBox="0 0 112 112" className="size-28 -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/30" />
                  <motion.circle
                    cx="56" cy="56" r="48" fill="none"
                    stroke="url(#roadmapGrad)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - overallPct / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="roadmapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">Done</span>
                  <span className="text-2xl font-[1000] text-primary leading-none">{overallPct}%</span>
                </div>
              </div>
              {/* Mini stats */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Layers size={13} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-[1000] text-foreground leading-none">{totals.completedLevels}<span className="text-muted-foreground/40 font-bold text-sm">/{totals.levelsCount}</span></p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 mt-0.5">Levels Done</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <BookOpen size={13} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-base font-[1000] text-foreground leading-none">{totals.completedTopics}<span className="text-muted-foreground/40 font-bold text-sm">/{totals.totalTopics}</span></p>
                    <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50 mt-0.5">Topics Done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── LEVELS ── */}
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[120px] rounded-[1.75rem] bg-muted/30" />
              ))}
            </div>
          )}
          {levelsWithStatus.map((level, index) => {
            const { isUnlocked, isComplete, progressPct } = level;

            return (
              <motion.div
                key={level._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
              >
                <div className={cn(
                  "group relative rounded-[1.75rem] border bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-md transition-all duration-300",
                  isComplete
                    ? "border-emerald-500/25 hover:border-emerald-500/40"
                    : isUnlocked
                      ? "border-primary/25 hover:border-primary/40"
                      : "border-border/40 opacity-60 hover:opacity-80"
                )}>
                  {/* Subtle glow on hover */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    isComplete
                      ? "bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)]"
                      : isUnlocked
                        ? "bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary),0.06),transparent_60%)]"
                        : ""
                  )} />

                  {/* Completed ribbon */}
                  {isComplete && (
                    <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none">
                      <div className="absolute top-3 right-[-18px] rotate-45 bg-emerald-500 text-white text-[7px] font-black uppercase tracking-widest py-1 px-6">
                        Done
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 p-6 md:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                      {/* Level number badge */}
                      <div className={cn(
                        "shrink-0 size-14 rounded-2xl border flex items-center justify-center text-xl font-[1000] transition-transform duration-300 group-hover:scale-105",
                        isComplete
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                          : isUnlocked
                            ? "bg-primary/10 border-primary/25 text-primary"
                            : "bg-muted/50 border-border/40 text-muted-foreground/30"
                      )}>
                        {isComplete ? <Check size={20} strokeWidth={2.5} /> : isUnlocked ? index + 1 : <Lock size={16} className="opacity-50" />}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-start gap-2">
                          <h2 className="text-lg md:text-xl font-[1000] uppercase tracking-tight text-foreground leading-none">
                            {level.title}
                          </h2>
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border",
                            isComplete
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : isUnlocked
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-muted/50 border-border/40 text-muted-foreground/40"
                          )}>
                            {isComplete ? <><Check size={7} /> Complete</> : isUnlocked ? <><Target size={7} /> In Progress</> : <><Lock size={7} /> Locked</>}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border border-border/30 bg-background/40 text-muted-foreground/40">
                            <Zap size={7} /> +{level.levelBonusXp ?? 500} XP bonus
                          </span>
                        </div>

                        {level.description && (
                          <p className="text-xs text-muted-foreground/60 leading-relaxed line-clamp-2 max-w-2xl">
                            {level.description}
                          </p>
                        )}

                        {/* Progress row */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 max-w-xs">
                            <div className="h-1.5 w-full rounded-full bg-background border border-border/30 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${progressPct}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.1 + index * 0.04 }}
                                className={cn(
                                  "h-full rounded-full",
                                  isComplete
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                    : "bg-gradient-to-r from-primary to-emerald-400"
                                )}
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground/50 shrink-0 tabular-nums">
                            {level.topicsUnlockedCount}/{level.topicsCount} topics
                          </span>
                          {progressPct > 0 && (
                            <span className={cn(
                              "text-[10px] font-black shrink-0",
                              isComplete ? "text-emerald-400" : "text-primary"
                            )}>
                              {progressPct}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="shrink-0">
                        {isUnlocked ? (
                          <Link
                            href={`/roadmap/levels/${level._id}`}
                            className={cn(
                              "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                              isComplete
                                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15"
                                : "bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-primary/30 hover:-translate-y-0.5"
                            )}
                          >
                            {isComplete ? "Review" : "Continue"}
                            {isComplete ? <ArrowRight size={12} /> : <ChevronRight size={12} />}
                          </Link>
                        ) : (
                          <div className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-wider border border-border/30 bg-muted/30 text-muted-foreground/30 cursor-not-allowed select-none">
                            <Lock size={11} /> Locked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Connector between levels */}
                {index < levelsWithStatus.length - 1 && (
                  <div className="flex items-center justify-center h-6 pointer-events-none">
                    <div className={cn(
                      "w-px h-full",
                      isComplete ? "bg-gradient-to-b from-emerald-500/40 to-primary/20" : "bg-border/20"
                    )} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* End node */}
          {levelsWithStatus.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center pt-4 pb-8 gap-4"
            >
              <div className="flex items-center justify-center h-6">
                <div className="w-px h-full bg-border/20" />
              </div>
              <div className={cn(
                "size-16 rounded-2xl border flex items-center justify-center transition-all duration-300",
                totals.completedLevels === totals.levelsCount && totals.levelsCount > 0
                  ? "bg-amber-500/10 border-amber-500/25 shadow-lg shadow-amber-500/10"
                  : "bg-muted/30 border-border/30"
              )}>
                <Trophy size={24} className={totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "text-amber-400" : "text-muted-foreground/20"} />
              </div>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground/40">
                  {totals.completedLevels === totals.levelsCount && totals.levelsCount > 0 ? "Roadmap Complete!" : "Finish all levels to claim this"}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;

"use client";

import {useMemo} from "react";
import Link from "next/link";
import {m} from "framer-motion";
import {
  Compass,
  Layers,
  Lock,
  Check,
  Target,
  Play,
  ChevronRight,
} from "lucide-react";
import {useRoadmapLevels} from "@/hooks/roadmap";
import Loader from "@/components/shared/Loader";
import {cn} from "@/lib/utils";

const Orb = ({className}: {className?: string}) => (
  <div
    className={cn(
      "absolute rounded-full pointer-events-none blur-[120px]",
      className
    )}
  />
);

const RoadmapLandingPage = () => {
  const {levels, isLoading} = useRoadmapLevels();

  const totals = useMemo(() => {
    const totalTopics = levels.reduce(
      (acc, lvl) => acc + (lvl.topicsCount ?? 0),
      0,
    );
    const unlockedTopics = levels.reduce(
      (acc, lvl) => acc + (lvl.topicsUnlockedCount ?? 0),
      0,
    );
    return {totalTopics, unlockedTopics, levelsCount: levels.length};
  }, [levels]);

  if (isLoading) {
    return <Loader message="Loading learning trail matrix..." />;
  }

  return (
    <div className="min-h-screen pb-28 pt-0 relative overflow-hidden bg-[linear-gradient(to_right,rgba(var(--primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
      
      {/* Background pulsing lighting nodes */}
      <Orb className="size-[600px] bg-primary/8 dark:bg-primary/5 top-20 left-1/4 animate-pulse [animation-duration:6s]" />
      <Orb className="size-[500px] bg-emerald-500/8 dark:bg-emerald-500/5 top-1/2 right-1/4 animate-pulse [animation-duration:8s]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Full-width Hero Section */}
        <m.div
          initial={{opacity: 0, y: 15}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5}}
          className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/40 dark:bg-card/20 backdrop-blur-xl overflow-hidden"
        >
          <div className="p-6 md:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                  <Compass className="size-4" />
                  Skill Map Campaign
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none">
                    Learning <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">Trail</span>
                  </h1>
                  <p className="text-sm text-muted-foreground/90 max-w-2xl leading-relaxed font-medium">
                    Follow the illuminated path of competitive programming milestones. Complete sheets and solve problems manually to progress through each level.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/30">
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4 text-center">
                <Layers className="size-5 mx-auto mb-2 text-primary/60" />
                <p className="text-2xl font-black text-foreground tabular-nums">{totals.levelsCount}</p>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mt-1">Trail Levels</span>
              </div>
              <div className="rounded-2xl border border-border/40 bg-background/40 p-4 text-center">
                <Target className="size-5 mx-auto mb-2 text-emerald-500/60" />
                <p className="text-2xl font-black text-foreground tabular-nums">{totals.totalTopics}</p>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block mt-1">Total Topics</span>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
                <Check className="size-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-black text-primary tabular-nums">{totals.unlockedTopics}</p>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 block mt-1">Unlocked</span>
              </div>
            </div>
          </div>
        </m.div>

        {/* Curriculum Path Section */}
        <section className="mt-20 relative">
          <div className="flex flex-col items-center justify-center text-center mb-16">
            <h2 className="text-2xl font-black uppercase tracking-[0.25em] text-foreground">
              Curriculum Trail
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-emerald-400 rounded-full mt-3 shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4">
            
            {/* Connecting Laser Path Circuit Line */}
            <div className="absolute left-1/2 top-4 bottom-4 w-1 -translate-x-1/2 bg-gradient-to-b from-primary/35 via-emerald-400/20 to-border/30 rounded-full hidden md:block" />

            {/* Path Items */}
            <div className="space-y-16">
              {levels.map((level, index) => {
                const isEven = index % 2 === 0;
                const progressPct = level.topicsCount
                  ? Math.min(
                      100,
                      Math.round(
                        (level.topicsUnlockedCount / level.topicsCount) * 100,
                      ),
                    )
                  : 0;
                const isFirstLevel = index === 0;
                const status =
                  isFirstLevel && level.topicsUnlockedCount === 0
                    ? "In Progress"
                    : level.topicsUnlockedCount === 0
                      ? "Locked"
                      : level.topicsUnlockedCount === level.topicsCount
                        ? "Complete"
                        : "In Progress";

                return (
                  <m.div
                    key={level._id}
                    initial={{opacity: 0, y: 35}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, margin: "-100px"}}
                    transition={{duration: 0.5}}
                    className={cn(
                      "flex flex-col md:flex-row items-center gap-8 relative",
                      isEven ? "md:flex-row-reverse" : ""
                    )}
                  >
                    {/* Glowing Hexagonal Node Indicator in the Center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                      <m.div
                        whileHover={{scale: 1.12}}
                        className={cn(
                          "size-12 rounded-xl border flex items-center justify-center text-xs font-[1000] shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300",
                          status === "Complete"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10"
                            : status === "In Progress"
                              ? "border-primary bg-primary/10 text-primary shadow-primary/10"
                              : "border-border bg-card text-muted-foreground/60"
                        )}
                      >
                        {status === "Complete" ? (
                          <Check size={14} strokeWidth={3} />
                        ) : status === "In Progress" ? (
                          <Target size={14} className="animate-spin [animation-duration:8s]" />
                        ) : (
                          <Lock size={12} className="opacity-60" />
                        )}
                      </m.div>
                    </div>

                    {/* Level Details Card */}
                    <div className="w-full md:w-[45%]">
                      <m.div
                        whileHover={{y: -3}}
                        className={cn(
                          "group relative rounded-3xl border p-6 sm:p-7 backdrop-blur-md shadow-lg transition-all duration-300 bg-card/35 dark:bg-card/15 hover:bg-card/50",
                          status === "Complete"
                            ? "border-emerald-500/30 hover:border-emerald-500/50"
                            : status === "In Progress"
                              ? "border-primary/30 hover:border-primary/50"
                              : "border-border/60 opacity-70 hover:opacity-100"
                        )}
                      >
                        {/* Mobile Node Badge */}
                        <div className="md:hidden inline-flex items-center gap-2 rounded-lg bg-muted/60 border border-border px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 mb-4">
                          Level {level.orderIndex}
                        </div>

                        <div className="flex flex-col justify-between h-full space-y-5">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                                {level.title}
                              </h3>
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] border shrink-0",
                                  status === "Complete"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : status === "In Progress"
                                      ? "bg-primary/10 border-primary/20 text-primary animate-pulse"
                                      : "bg-muted border-border/40 text-muted-foreground/50"
                                )}
                              >
                                {status}
                              </span>
                            </div>
                            
                            <p className="text-xs text-muted-foreground/90 leading-relaxed font-medium line-clamp-3">
                              {level.description || "No level detailed formulation is recorded."}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-border/40 dark:border-border/20 space-y-4">
                            
                            {/* Detailed progress bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                                <span>Unlocked Sessions</span>
                                <span className="text-foreground font-bold">
                                  {level.topicsUnlockedCount}/{level.topicsCount} ({progressPct}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-background border border-border/40 shadow-inner overflow-hidden">
                                <m.div
                                  initial={{width: 0}}
                                  whileInView={{width: `${progressPct}%`}}
                                  viewport={{once: true}}
                                  transition={{duration: 0.8, delay: 0.2}}
                                  className={cn(
                                    "h-full rounded-full",
                                    status === "Complete"
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                      : "bg-gradient-to-r from-primary to-emerald-400"
                                  )}
                                />
                              </div>
                            </div>

                            {/* Enter Level Button */}
                            {status === "Locked" ? (
                              <div className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/20 py-3 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/40 cursor-not-allowed select-none">
                                <Lock size={12} /> Complete Prior Nodes
                              </div>
                            ) : (
                              <Link
                                href={`/roadmap/levels/${level._id}`}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 hover:border-primary/40 bg-background/50 py-3 text-xs font-black uppercase tracking-[0.15em] text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
                              >
                                <Play size={10} className="fill-current" /> Explore Mission
                                <ChevronRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </m.div>
                    </div>

                    {/* Placeholder on the opposite side to balance the grid layout */}
                    <div className="hidden md:block w-[45%]" />
                  </m.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoadmapLandingPage;

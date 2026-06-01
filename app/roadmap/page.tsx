"use client";

import {useMemo} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {
  Compass,
  Trophy,
  Zap,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  Lock,
  Check,
  Target,
  Play,
} from "lucide-react";
import {useRoadmapLevels, useRoadmapUserSummary} from "@/hooks/useRoadmap";
import Loader from "@/components/shared/Loader";
import useUser from "@/hooks/useUser";
import {cn} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

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
  const {user} = useUser();
  const {summary} = useRoadmapUserSummary(!!user);

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
      <Orb className="w-[600px] h-[600px] bg-primary/8 dark:bg-primary/5 top-20 left-1/4 animate-pulse duration-[6s]" />
      <Orb className="w-[500px] h-[500px] bg-emerald-500/8 dark:bg-emerald-500/5 top-1/2 right-1/4 animate-pulse duration-[8s]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Floating Dashboard HUD */}
        <div className="grid gap-6 lg:grid-cols-12 mb-16">
          
          {/* Left HUD: CP Quest Map Info */}
          <motion.div
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-3xl border border-border/60 dark:border-border/40 bg-card/40 dark:bg-card/20 backdrop-blur-xl"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
                <Compass className="h-4 w-4" />
                Skill Map Campaign
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none">
                  Learning <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">Trail</span>
                </h1>
                <p className="text-sm text-muted-foreground/90 max-w-xl leading-relaxed font-medium">
                  Follow the illuminated path of competitive programming milestones. Complete sheets and solve problems manually to progress.
                </p>
              </div>
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/30">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">Trail Levels</span>
                <p className="text-2xl font-black text-foreground mt-1">{totals.levelsCount}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">Total Topics</span>
                <p className="text-2xl font-black text-foreground mt-1">{totals.totalTopics}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary block">Unlocked</span>
                <p className="text-2xl font-black text-primary mt-1">{totals.unlockedTopics}</p>
              </div>
            </div>
          </motion.div>

          {/* Right HUD: Gladiator Profile Console */}
          <motion.div
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5, delay: 0.1}}
            className="lg:col-span-5"
          >
            {user && summary ? (
              <Card className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/40 dark:bg-card/20 p-6 md:p-8 shadow-xl backdrop-blur-xl flex flex-col justify-between h-full space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar with status ring */}
                      <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-emerald-400 shadow-md">
                        <Avatar className="w-10 h-10 border-2 border-card">
                          <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                          <AvatarFallback className="text-[10px] font-bold uppercase text-primary bg-primary/10">
                            {user.codeforcesHandle?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="leading-tight">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">GLADIATOR</span>
                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                          {user.codeforcesHandle}
                        </h4>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/15 uppercase tracking-wider">
                      <Zap size={10} className="fill-current animate-pulse" />
                      {summary.currentLevel?.title || "Novice"}
                    </span>
                  </div>

                  {/* Level status indicators */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">Score Points</span>
                      <p className="text-xl font-[1000] text-primary mt-1.5 tabular-nums">
                        {summary.totalXp.toLocaleString()} <span className="text-[10px] font-semibold text-muted-foreground/50">XP</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/50 p-3.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 block">Problems AC</span>
                      <p className="text-xl font-[1000] text-emerald-500 mt-1.5 tabular-nums">
                        {summary.problemsSolved} <span className="text-[10px] font-semibold text-muted-foreground/50">AC</span>
                      </p>
                    </div>
                  </div>

                </div>

                <Button
                  asChild
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:brightness-110 transition-all duration-300"
                >
                  <Link href="/roadmap/leaderboard" className="flex items-center justify-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Open Leaderboard
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            ) : (
              <Card className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/20 p-6 md:p-8 h-full flex flex-col justify-center space-y-4 backdrop-blur-xl">
                <div className="flex items-center gap-3 text-primary">
                  <Shield className="h-6 w-6" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Console Offline</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Authentication recommended. Sign in to capture XP rewards, unlock subsequent session nodes, and track your ranking profile.
                </p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="h-9 flex-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild className="h-9 flex-1 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                    <Link href="/signup">Register</Link>
                  </Button>
                </div>
              </Card>
            )}
          </motion.div>
        </div>

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
                  <motion.div
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
                      <motion.div
                        whileHover={{scale: 1.12}}
                        className={cn(
                          "h-12 w-12 rounded-xl border flex items-center justify-center text-xs font-[1000] shadow-lg backdrop-blur-md cursor-pointer transition-all duration-300",
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
                          <Target size={14} className="animate-spin duration-[8s]" />
                        ) : (
                          <Lock size={12} className="opacity-60" />
                        )}
                      </motion.div>
                    </div>

                    {/* Level Details Card */}
                    <div className="w-full md:w-[45%]">
                      <motion.div
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
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    status === "Complete"
                                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                                      : "bg-gradient-to-r from-primary to-emerald-400"
                                  )}
                                  style={{width: `${progressPct}%`}}
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
                                <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Placeholder on the opposite side to balance the grid layout */}
                    <div className="hidden md:block w-[45%]" />
                  </motion.div>
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

"use client";

import Link from "next/link";
import {useMemo} from "react";
import {useParams} from "next/navigation";
import {m as motion} from "framer-motion";
import {
  ChevronRight,
  Lock,
  Target,
  ArrowLeft,
  Award,
  Activity,
  Shield,
  Play,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import {useRoadmapLevel} from "@/hooks/roadmap/useRoadmap";
import {cn} from "@/lib/utils";
import {progressWidthClass} from "@/components/features/roadmap";

const Orb = ({className}: {className?: string}) => (
  <div
    className={cn(
      "absolute rounded-full pointer-events-none blur-[120px]",
      className,
    )}
  />
);

const getLevelNodeTier = (orderIndex: number) => {
  if (orderIndex === 0)
    return {
      name: "Beginner Node",
      color: "text-slate-400",
      border: "border-slate-500/20",
      bg: "bg-slate-500/10",
    };
  if (orderIndex === 1)
    return {
      name: "Recruit Node",
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/10",
    };
  if (orderIndex === 2)
    return {
      name: "Gladiator Node",
      color: "text-cyan-400",
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/10",
    };
  if (orderIndex === 3)
    return {
      name: "Elite Node",
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    };
  return {
    name: "Grandmaster Node",
    color: "text-primary",
    border: "border-primary/20",
    bg: "bg-primary/10",
  };
};

const LevelPage = () => {
  const params = useParams<{id: string}>();
  const levelId = params?.id;
  const {data, isLoading} = useRoadmapLevel(levelId);

  const progressPct = useMemo(() => {
    if (!data?.level?.topicsCount) return 0;
    return Math.min(
      100,
      Math.round(
        (data.level.topicsUnlockedCount / data.level.topicsCount) * 100,
      ),
    );
  }, [data]);

  if (isLoading || !data) {
    return <Loader message="Loading curriculum level..." />;
  }

  const levelIndex = data.level.orderIndex ?? 0;
  const tier = getLevelNodeTier(levelIndex);

  return (
    <div className="min-h-screen pb-20 pt-0 relative overflow-hidden bg-[linear-gradient(to_right,rgba(var(--primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
      {/* Ambient background glows */}
      <Orb className="size-[500px] bg-primary/5 dark:bg-primary/4 top-10 left-1/4 animate-pulse [animation-duration:7s]" />
      <Orb className="size-[400px] bg-emerald-500/5 dark:bg-emerald-500/4 bottom-10 right-1/4 animate-pulse [animation-duration:9s]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Navigation & Header */}
        <div className="pb-6">
          <Link
            href="/roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 dark:border-border/40 hover:border-primary/40 dark:hover:border-primary/40 bg-card/60 hover:bg-primary/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-foreground hover:text-primary transition-all duration-300"
          >
            <ArrowLeft className="size-4" />
            Back to Console
          </Link>
        </div>

        {/* Level Hero Header */}
        <motion.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="relative overflow-hidden rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/20 p-6 md:p-8 backdrop-blur-xl shadow-xl"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/10 blur-[100px] opacity-70" />
            <div className="absolute bottom-0 left-10 size-48 rounded-full bg-emerald-500/5 blur-[80px] opacity-50" />
          </div>

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            {/* Left Description Briefing */}
            <div className="lg:col-span-8 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  <Target size={11} /> Level Briefing
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em]",
                    tier.color,
                    tier.bg,
                    tier.border,
                  )}
                >
                  <Shield size={11} /> {tier.name} (Lvl {levelIndex})
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none">
                  {data.level.title}
                </h1>
                <p className="text-sm text-muted-foreground/80 max-w-3xl leading-relaxed font-medium">
                  {data.level.description ||
                    "No curriculum description formulated yet for this level."}
                </p>
              </div>
            </div>

            {/* Right progress indicator */}
            <div className="lg:col-span-4 rounded-2xl border border-border/60 dark:border-border/40 bg-background/50 p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                <span>Missions Completed</span>
                <span className="text-primary font-bold">
                  {data.level.topicsUnlockedCount} / {data.level.topicsCount} (
                  {progressPct}% Completed)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border/40">
                <motion.div
                  initial={{width: 0}}
                  animate={{width: `${progressPct}%`}}
                  transition={{duration: 0.8}}
                  className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
                />
              </div>

              <div className="pt-3 border-t border-border/30 flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 uppercase">
                <span className="flex items-center gap-1 text-primary">
                  <Award size={14} /> Level Bonus: +
                  {data.level.levelBonusXp ?? 500} XP
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sessions Grid */}
        <section className="mt-14 space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-card p-2 text-primary shadow-sm">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
                Missions & Practical Labs
              </h2>
              <p className="text-xs text-muted-foreground/80 font-medium">
                Finish watching lecture modules & optional materials to unlock
                practical programming sheets.
              </p>
            </div>
          </div>

          {/* Grid Layout of Sessions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.topics.map((topic, idx) => {
              const isLocked = topic.progress?.isLocked;
              const isComplete = topic.progress?.isComplete;
              const learningPct = Math.round(topic.progress?.learningPct ?? 0);
              const problemPct = Math.round(topic.progress?.problemPct ?? 0);
              const isProblemsUnlocked =
                learningPct >= (topic.requiredLearningPct ?? 80);

              const status = isLocked
                ? "Locked"
                : isComplete
                  ? "Completed"
                  : isProblemsUnlocked
                    ? "Practice Open"
                    : learningPct > 0
                      ? "Learning Active"
                      : "Unstarted";

              return (
                <motion.div
                  key={topic._id}
                  initial={{opacity: 0, y: 15}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.4, delay: idx * 0.04}}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-3xl border p-5 bg-card/45 dark:bg-card/15 hover:bg-card/65 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 hover:border-primary/30",
                    isLocked && "opacity-90",
                  )}
                >
                  {/* Glassmorphic Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-background/95 dark:bg-background/90 text-center p-6 border border-border/80 dark:border-border/60 z-20">
                      <div className="rounded-2xl bg-muted border border-border p-3 mb-3 shadow-md">
                        <Lock className="size-5 text-muted-foreground/60 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                        Mission Locked
                      </h4>
                      <p className="text-[10px] text-muted-foreground/75 mt-1.5 max-w-[220px] leading-relaxed font-medium">
                        Complete previous sessions first:
                      </p>
                      <div className="mt-2.5 space-y-1.5">
                        <span className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary">
                          <BookOpen className="size-3" />
                          Learn {topic.requiredLearningPct}%
                        </span>
                        <span className="flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-500">
                          <CheckCircle2 className="size-3" />
                          Solve {topic.requiredProblemPct}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 block group-hover:text-primary transition-colors">
                          Mission {topic.orderIndex}
                        </span>
                        <h3 className="text-base font-black text-foreground mt-1">
                          {topic.title}
                        </h3>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider border",
                          status === "Completed"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm"
                            : status === "Practice Open"
                              ? "bg-teal-500/10 border-teal-500/20 text-teal-500"
                              : status === "Learning Active"
                                ? "bg-amber-500/5 border-amber-500/10 text-amber-500"
                                : "bg-muted border-border/80 text-foreground",
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/70 leading-relaxed font-medium line-clamp-3">
                      {topic.description ||
                        "No session detail formulations recorded."}
                    </p>

                    {/* Subtopics tag list */}
                    {topic.subtopics?.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {topic.subtopics.slice(0, 3).map((sub) => (
                          <span
                            key={sub}
                            className="rounded-lg border border-border/60 bg-background/60 px-2 py-1 text-[9px] font-bold text-muted-foreground/80"
                          >
                            {sub}
                          </span>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <span className="rounded-lg border border-border/40 bg-background/20 px-2 py-0.5 text-[8px] font-bold text-muted-foreground/40">
                            +{topic.subtopics.length - 3}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/40 dark:border-border/20 space-y-4">
                    {/* Learning Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          Learning progress
                        </span>
                        <span className="text-foreground font-bold">
                          {learningPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-background border border-border/40 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-300", progressWidthClass(learningPct))}
                        />
                      </div>
                    </div>

                    {/* Problems Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          Practice solved
                        </span>
                        <span
                          className={cn(
                            "font-bold",
                            isProblemsUnlocked
                              ? "text-foreground"
                              : "text-muted-foreground/30",
                          )}
                        >
                          {isProblemsUnlocked ? `${problemPct}%` : "Locked"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-background border border-border/40 overflow-hidden">
                        {isProblemsUnlocked ? (
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300", progressWidthClass(problemPct))}
                          />
                        ) : (
                          <div className="h-full rounded-full bg-muted/50 w-full" />
                        )}
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/60">
                      <span className="inline-flex items-center gap-1">
                        <Target className="size-3.5" />
                        {topic.problemsCount ?? 0} problems
                      </span>
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Award className="size-3.5" />+
                        {topic.topicXpReward ?? 100} XP
                      </span>
                    </div>

                    <Link
                      href={`/roadmap/levels/${levelId}/topics/${topic._id}`}
                      className={cn(
                        "w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-border/80 hover:border-primary/40 bg-background/50 py-3 text-xs font-black uppercase tracking-[0.15em] text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 group",
                        isLocked && "pointer-events-none opacity-50",
                      )}
                    >
                      <Play size={10} className="fill-current" /> Enter Mission
                      <ChevronRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LevelPage;

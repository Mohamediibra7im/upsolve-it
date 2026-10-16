"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import StudioProgress from "@/components/features/profile/StudioProgress";
import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { m as motion } from "framer-motion";
import {
  Lock,
  Target,
  Activity,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useRoadmapLevel } from "@/hooks/roadmap/useRoadmap";
import { cn } from "@/lib/utils";

const getLevelTier = (orderIndex: number) => {
  if (orderIndex === 0)
    return {
      name: "Beginner",
      color: "text-slate-400",
      border: "border-slate-500/20",
      bg: "bg-slate-500/10",
    };
  if (orderIndex === 1)
    return {
      name: "Recruit",
      color: "text-blue-400",
      border: "border-primary/20",
      bg: "bg-primary/10",
    };
  if (orderIndex === 2)
    return {
      name: "Gladiator",
      color: "text-cyan-400",
      border: "border-primary/20",
      bg: "bg-primary/10",
    };
  if (orderIndex === 3)
    return {
      name: "Elite",
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/10",
    };
  return {
    name: "Grandmaster",
    color: "text-primary",
    border: "border-primary/20",
    bg: "bg-primary/10",
  };
};

const LevelPage = () => {
  const params = useParams<{ id: string }>();
  const levelId = params?.id;
  const { data, isLoading, error, mutate } = useRoadmapLevel(levelId);

  const progressPct = useMemo(() => {
    if (!data?.level?.topicsCount) return 0;
    return Math.min(
      100,
      Math.round(
        (data.level.topicsUnlockedCount / data.level.topicsCount) * 100,
      ),
    );
  }, [data]);


  if (error && !data) return <MemberPageState kind="error" title="This level is unavailable" description="We couldn’t load its topics. Try again, or return to your roadmap."><Button variant="outline" onClick={() => mutate()}>Try again</Button><Button asChild variant="ghost"><Link href="/roadmap">Back to roadmap</Link></Button></MemberPageState>;
  if (isLoading || !data) return <MemberPageState kind="loading" title="Opening this level" description="Gathering your topics and progress." />;

  const levelIndex = data.level.orderIndex ?? 0;
  const tier = getLevelTier(levelIndex);

  return (
    <div className="min-h-screen pb-20 relative font-sans text-foreground">
      {/* Background */}

      <div className="mx-auto w-full relative z-10 max-w-6xl space-y-6">

        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-8"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target size={12} className="text-primary" />
            <span>About this level</span>
            <span className="flex-1 border-b border-border" />
            <span>{tier.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                {data.level.title}
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                {data.level.description || "Explore the topics in this level and build your understanding step by step."}
              </p>
            </div>

            {/* Level progress readout */}
            <div className="shrink-0 space-y-2 text-right">
              <span className="text-xs font-medium text-muted-foreground">Level progress</span>
              <div className="flex items-center justify-end gap-3 text-xs">
                <StudioProgress value={progressPct} label="Level progress" className="w-24 sm:w-32" />
                <span className="font-medium text-foreground">{progressPct}%</span>
              </div>
              <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                <span>Topics: {data.level.topicsUnlockedCount}/{data.level.topicsCount}</span>
                <span>•</span>
                <span>Bonus: +{data.level.levelBonusXp ?? 500} XP</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sessions Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Activity size={12} className="text-primary" />
            <span>Topics and practice</span>
            <span className="flex-1 border-b border-border" />
          </div>

          {data.topics.length === 0 && <MemberPageState title="More to learn, soon" description="Topics for this level are being prepared. Your progress will be ready when they arrive."><Button asChild variant="outline"><Link href="/roadmap">Back to roadmap</Link></Button></MemberPageState>}
          {/* Topic collection */}
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
                  ? "Complete"
                  : isProblemsUnlocked
                    ? "Ready to practice"
                    : learningPct > 0
                      ? "Learning in progress"
                      : "Not started";


              return (
                <motion.div
                  key={topic._id}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                  className="relative flex flex-col justify-between rounded-2xl border border-border bg-card overflow-hidden"
                >
                  {/* Header bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                    <span className="text-xs font-medium text-muted-foreground">
                      Topic {String(topic.orderIndex).padStart(2, "0")}
                    </span>
                    <span className={cn(
                      "text-xs font-medium px-1.5 py-0.5 rounded-lg border",
                      isComplete
                        ? "bg-primary/10 border-border text-primary"
                        : isProblemsUnlocked
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-primary/10 border-border text-muted-foreground"
                    )}>
                      {status}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {topic.description}
                        </p>
                      )}

                      {/* Subtopics tags */}
                      {topic.subtopics?.length ? (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {topic.subtopics.slice(0, 3).map((sub) => (
                            <span
                              key={sub}
                              className="text-xs font-medium text-muted-foreground"
                            >
                              {sub}
                            </span>
                          ))}
                          {topic.subtopics.length > 3 && (
                            <span className="text-xs font-medium text-muted-foreground">
                              +{topic.subtopics.length - 3}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Progress details */}
                    <div className="pt-3 border-t border-border space-y-2.5">
                      {/* Learn Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen size={10} />
                            Learning
                          </span>
                          <span className="font-medium text-foreground tabular-nums">
                            {learningPct}%
                          </span>
                        </div>
                        <StudioProgress value={learningPct} label="Topic learning progress" className="w-24 sm:w-32" />
                      </div>

                      {/* Problems Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            Practice
                          </span>
                          <span className="font-medium text-foreground tabular-nums">
                            {isProblemsUnlocked ? `${problemPct}%` : "Locked"}
                          </span>
                        </div>
                        <StudioProgress value={problemPct} label="Topic practice progress" className="w-24 sm:w-32" />
                      </div>

                      {/* Target count / XP */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{topic.problemsCount ?? 0} problems</span>
                        <span>+{topic.topicXpReward ?? 100} XP</span>
                      </div>

                      {isLocked ? <div className="rounded-xl bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground"><Lock className="mb-2 size-4" />Complete the previous topic to unlock this one. Aim for {topic.requiredLearningPct}% learning and {topic.requiredProblemPct}% practice.</div> : <Link
                        href={`/roadmap/levels/${levelId}/topics/${topic._id}`}
                        className={cn(
                          "w-full h-9 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all inline-flex items-center justify-center font-sans",
                          isLocked && "pointer-events-none opacity-50",
                        )}
                      >
                        Open topic
                      </Link>}
                    </div>
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

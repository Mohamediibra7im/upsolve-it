"use client";

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
  Cpu,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import { useRoadmapLevel } from "@/hooks/roadmap/useRoadmap";
import { cn } from "@/lib/utils";

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
  const params = useParams<{ id: string }>();
  const levelId = params?.id;
  const { data, isLoading } = useRoadmapLevel(levelId);

  const progressPct = useMemo(() => {
    if (!data?.level?.topicsCount) return 0;
    return Math.min(
      100,
      Math.round(
        (data.level.topicsUnlockedCount / data.level.topicsCount) * 100,
      ),
    );
  }, [data]);

  // Progress blocks
  const totalBlocks = 20;
  const filledBlocks = Math.min(totalBlocks, Math.round((progressPct / 100) * totalBlocks));

  if (isLoading || !data) {
    return <Loader message="Loading curriculum level..." />;
  }

  const levelIndex = data.level.orderIndex ?? 0;
  const tier = getLevelNodeTier(levelIndex);

  return (
    <div className="min-h-screen pb-20 relative font-mono text-emerald-400">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl space-y-6">
        {/* Terminal Header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 pt-8"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Target size={12} className="text-emerald-400" />
            <span>LEVEL_BRIEFING // SYSTEM_SECTOR</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>{tier.name.toUpperCase()}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                {data.level.title}
              </h1>
              <p className="text-[11px] text-emerald-500/40 max-w-3xl leading-relaxed">
                {data.level.description || "No level description formulated yet."}
              </p>
            </div>

            {/* Level progress readout */}
            <div className="shrink-0 space-y-2 text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">LEVEL_COMPILATION</span>
              <div className="flex items-center justify-end gap-3 text-xs">
                <span className="flex items-center">
                  <span className="text-emerald-500/30">[</span>
                  <span className="text-emerald-400">{"█".repeat(filledBlocks)}</span>
                  <span className="text-emerald-500/15">{"░".repeat(totalBlocks - filledBlocks)}</span>
                  <span className="text-emerald-500/30">]</span>
                </span>
                <span className="font-bold text-emerald-300">{progressPct}%</span>
              </div>
              <div className="flex items-center justify-end gap-3 text-[9px] text-emerald-500/30">
                <span>MISSIONS: {data.level.topicsUnlockedCount}/{data.level.topicsCount}</span>
                <span>•</span>
                <span>BONUS: +{data.level.levelBonusXp ?? 500} XP</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Sessions Section */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Activity size={12} className="text-emerald-400" />
            <span>MISSIONS_AND_PRACTICAL_LABS // CURRICULUM_LOG</span>
            <span className="flex-1 border-b border-emerald-500/10" />
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
                ? "LOCKED"
                : isComplete
                  ? "COMPLETED"
                  : isProblemsUnlocked
                    ? "PRACTICE_OPEN"
                    : learningPct > 0
                      ? "LEARNING_ACTIVE"
                      : "UNSTARTED";

              // Progress bar segments
              const learnSegs = Math.min(10, Math.round((learningPct / 100) * 10));
              const probSegs = Math.min(10, Math.round((problemPct / 100) * 10));

              return (
                <motion.div
                  key={topic._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.02 }}
                  className="relative flex flex-col justify-between rounded-lg border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden"
                >
                  {/* Lock Screen */}
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060a08]/95 text-center p-5 z-20">
                      <div className="rounded border border-emerald-500/20 bg-emerald-950/15 p-2.5 mb-2.5">
                        <Lock size={16} className="text-emerald-500/40" />
                      </div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                        MISSION_LOCKED
                      </h4>
                      <p className="text-[9px] text-emerald-500/30 mt-1 max-w-[200px] leading-relaxed">
                        Complete previous sessions to unlock this sector parameters:
                      </p>
                      <div className="mt-2 space-y-1">
                        <span className="flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider text-primary">
                          Learn {topic.requiredLearningPct}%
                        </span>
                        <span className="flex items-center justify-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-500">
                          Solve {topic.requiredProblemPct}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-[#081210]">
                    <span className="text-[9px] font-bold text-emerald-500/50 uppercase">
                      MISSION_{String(topic.orderIndex).padStart(2, "0")}
                    </span>
                    <span className={cn(
                      "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                      isComplete
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : isProblemsUnlocked
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-emerald-500/5 border-emerald-500/5 text-emerald-500/30"
                    )}>
                      {status}
                    </span>
                  </div>

                  {/* Content details */}
                  <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-emerald-300 uppercase">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-[10px] text-emerald-500/40 leading-relaxed line-clamp-3">
                          {topic.description}
                        </p>
                      )}

                      {/* Subtopics tags */}
                      {topic.subtopics?.length ? (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {topic.subtopics.slice(0, 3).map((sub) => (
                            <span
                              key={sub}
                              className="text-[8px] font-bold text-emerald-500/30 uppercase"
                            >
                              [{sub}]
                            </span>
                          ))}
                          {topic.subtopics.length > 3 && (
                            <span className="text-[8px] font-bold text-emerald-500/20 uppercase">
                              [+{topic.subtopics.length - 3}]
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {/* Progress details */}
                    <div className="pt-3 border-t border-emerald-500/[0.07] space-y-2.5">
                      {/* Learn Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-emerald-500/45">
                          <span className="flex items-center gap-1">
                            <BookOpen size={10} />
                            LEARNING
                          </span>
                          <span className="font-bold text-emerald-300 tabular-nums">
                            {learningPct}%
                          </span>
                        </div>
                        <div className="text-[9px] tabular-nums flex items-center">
                          <span className="text-emerald-500/30">[</span>
                          <span className="text-emerald-400">{"█".repeat(learnSegs)}</span>
                          <span className="text-emerald-500/15">{"░".repeat(10 - learnSegs)}</span>
                          <span className="text-emerald-500/30">]</span>
                        </div>
                      </div>

                      {/* Problems Progress */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-emerald-500/45">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            PRACTICE
                          </span>
                          <span className="font-bold text-emerald-300 tabular-nums">
                            {isProblemsUnlocked ? `${problemPct}%` : "LOCKED"}
                          </span>
                        </div>
                        <div className="text-[9px] tabular-nums flex items-center">
                          {isProblemsUnlocked ? (
                            <>
                              <span className="text-emerald-500/30">[</span>
                              <span className="text-emerald-400">{"█".repeat(probSegs)}</span>
                              <span className="text-emerald-500/15">{"░".repeat(10 - probSegs)}</span>
                              <span className="text-emerald-500/30">]</span>
                            </>
                          ) : (
                            <span className="text-emerald-500/20">[░░░░░░░░░░]</span>
                          )}
                        </div>
                      </div>

                      {/* Target count / XP */}
                      <div className="flex items-center justify-between text-[8px] text-emerald-500/35 uppercase tracking-wider">
                        <span>{topic.problemsCount ?? 0} problems</span>
                        <span>+{topic.topicXpReward ?? 100} XP</span>
                      </div>

                      <Link
                        href={`/roadmap/levels/${levelId}/topics/${topic._id}`}
                        className={cn(
                          "w-full h-9 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all inline-flex items-center justify-center font-mono",
                          isLocked && "pointer-events-none opacity-50",
                        )}
                      >
                        [ ENTER_MISSION.EXE ]
                      </Link>
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

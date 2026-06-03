"use client";

import Link from "next/link";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useParams} from "next/navigation";
import {m, AnimatePresence} from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Target,
  Video,
  ExternalLink,
  ChevronRight,
  Check,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import {useRoadmapTopic} from "@/hooks/roadmap";
import { VideoPlayer, progressWidthClass } from "@/components/features/roadmap";
import {apiClient} from "@/lib/apiClient";
import {useToast} from "@/components/providers/Toast";
import {useUser} from "@/hooks/auth";
import {cn} from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {ToggleProblemResult} from "@/types/Roadmap";
import {Button} from "@/components/ui/button";

const Orb = ({className}: {className?: string}) => (
  <div
    className={cn(
      "absolute rounded-full pointer-events-none blur-[120px]",
      className
    )}
  />
);

// Helper to construct Codeforces problem URL
const getCodeforcesUrl = (cfProblemId: string): string => {
  const trimmed = cfProblemId.trim();
  if (trimmed.toLowerCase().startsWith("http://") || trimmed.toLowerCase().startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.toLowerCase().startsWith("gym/")) {
    const parts = trimmed.split("/").filter(Boolean);
    const contestId = parts[1];
    const index = parts[2];
    return `https://codeforces.com/gym/${contestId}/problem/${index}`;
  }

  if (trimmed.includes("/")) {
    const parts = trimmed.split("/").filter(Boolean);
    const contestId = parts[0];
    const index = parts[1];
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  }

  const match = trimmed.match(/^(\d+)([A-Za-z][A-Za-z0-9]*)$/);
  if (match) {
    const contestId = match[1];
    const index = match[2];
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  }

  return `https://codeforces.com/problemset`;
};

// Helper to extract problem title for display
const getProblemDisplayName = (problem: { cfProblemId: string; title: string }) => {
  return problem.title || problem.cfProblemId;
};

const TopicPage = () => {
  const params = useParams<{id: string; topicId: string}>();
  const levelId = params?.id;
  const topicId = params?.topicId;
  const {data, isLoading, mutate} = useRoadmapTopic(levelId, topicId);
  const {toast} = useToast();
  const {user} = useUser();
  const lastSentRef = useRef(0);
  const unlockedRef = useRef(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<"video" | "problems">("video");

  const threshold = data?.level?.videoUnlockSheetPct ?? 80;

  const progressPct = useMemo(() => {
    return Math.min(100, Math.max(0, data?.progress?.videoPct ?? 0));
  }, [data]);

  const solvedCount = useMemo(() => {
    if (!data?.problems || !data?.progress?.problemProgress) return 0;
    return data.problems.filter((p) => data.progress.problemProgress[p._id])
      .length;
  }, [data?.problems, data?.progress?.problemProgress]);

  const totalCount = data?.problems?.length ?? 0;
  const sheetPct =
    totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const sheetUnlocked = data?.progress?.sheetUnlocked;

  const isNextUnlocked = useMemo(() => {
    return progressPct >= threshold || !!sheetUnlocked;
  }, [progressPct, threshold, sheetUnlocked]);

  useEffect(() => {
    if (sheetUnlocked !== undefined) {
      unlockedRef.current = sheetUnlocked;
    }
  }, [sheetUnlocked]);

  const handleProgress = useCallback(
    async (payload: {
      currentTime: number;
      duration: number;
      percent: number;
    }) => {
      if (!user || !data?.video?._id) return;
      const now = Date.now();
      if (now - lastSentRef.current < 5000) return;
      lastSentRef.current = now;

      try {
        const res = await apiClient.post<{
          watchPct: number;
          lastPositionSec: number;
          sheetUnlocked: boolean;
          threshold: number;
        }>(`/api/roadmap/videos/${data.video._id}/progress`, {
          watchPct: payload.percent,
          positionSec: Math.floor(payload.currentTime),
        });

        const prevUnlocked = unlockedRef.current;
        unlockedRef.current = res.sheetUnlocked;

        mutate(
          (current) =>
            current
              ? {
                  ...current,
                  progress: {
                    ...current.progress,
                    videoPct: res.watchPct,
                    sheetUnlocked: res.sheetUnlocked,
                    lastPositionSec: res.lastPositionSec,
                  },
                }
              : current,
          false,
        );

        if (!prevUnlocked && res.sheetUnlocked) {
          toast({
            title: "Sheet unlocked",
            description: `Great job! You hit the ${res.threshold}% mark.`,
            variant: "success",
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [data?.video?._id, mutate, toast, user],
  );

  if (isLoading || !data) {
    return <Loader message="Loading session..." />;
  }

  const handleToggleProblem = async (problemId: string, currentlySolved: boolean) => {
    if (!user || togglingIds.has(problemId)) return;
    const newSolved = !currentlySolved;

    // Mark as toggling
    setTogglingIds((prev) => new Set(prev).add(problemId));

    // Optimistic update
    mutate((current) => {
      if (!current) return current;
      return {
        ...current,
        progress: {
          ...current.progress,
          problemProgress: {
            ...current.progress.problemProgress,
            [problemId]: newSolved,
          },
        },
      };
    }, false);

    try {
      const res = await apiClient.post<ToggleProblemResult>(
        `/api/roadmap/problems/${problemId}/toggle`,
        { solved: newSolved },
      );

      if (newSolved && res.xpDelta > 0) {
        toast({
          title: "Problem Solved!",
          description: `Earned +${res.xpDelta} XP!`,
          variant: "success",
        });
      } else if (!newSolved) {
        toast({
          title: "Problem Unmarked",
          description: "Progress updated.",
          variant: "default",
        });
      }

      // Revalidate from server for full consistency
      mutate();
    } catch (err: any) {
      // Revert on error
      mutate();
      toast({
        title: "Update Failed",
        description: err.message || "Could not update problem status.",
        variant: "destructive",
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(problemId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-0 relative overflow-hidden bg-[linear-gradient(to_right,rgba(var(--primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.02)_1px,transparent_1px)] bg-[size:32px_32px]">
      
      {/* Background ambient orbs */}
      <Orb className="size-[500px] bg-primary/6 dark:bg-primary/4 top-10 left-1/4 animate-pulse [animation-duration:8s]" />
      <Orb className="size-[450px] bg-emerald-500/6 dark:bg-emerald-500/4 bottom-10 right-1/4 animate-pulse [animation-duration:10s]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-5xl">
        
        {/* Navigation & Stepper Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6">
          <Link
            href={`/roadmap/levels/${levelId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 dark:border-border/40 hover:border-primary/40 dark:hover:border-primary/40 bg-card/60 hover:bg-primary/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-foreground hover:text-primary transition-all duration-300"
          >
            <ArrowLeft className="size-4" />
            Back to Level
          </Link>

          {/* Stepper Tabs */}
          <div className="flex rounded-2xl border border-border/80 dark:border-border/40 bg-card/60 p-1 md:p-1.5 max-w-sm w-full shadow-md backdrop-blur-md">
            <button
              type="button"
              onClick={() => setCurrentStep("video")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all duration-350",
                currentStep === "video"
                  ? "bg-primary text-primary-foreground font-black shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="size-4" />
              1. Video
            </button>
            <button
              type="button"
              onClick={() => {
                if (isNextUnlocked) {
                  setCurrentStep("problems");
                } else {
                  toast({
                    title: "Sheet Locked",
                    description: `Watch at least ${threshold}% of the video to unlock.`,
                    variant: "destructive",
                  });
                }
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all duration-355",
                currentStep === "problems"
                  ? "bg-primary text-primary-foreground font-black shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground",
                !isNextUnlocked && "cursor-not-allowed opacity-40"
              )}
            >
              {!isNextUnlocked ? (
                <Lock className="size-4" />
              ) : (
                <Target className="size-4" />
              )}
              2. Problems
            </button>
          </div>
        </div>

        {/* Topic Header Hero Section */}
        <m.section
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.6}}
          className="relative overflow-hidden rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/20 p-6 md:p-8 backdrop-blur-xl shadow-xl"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-12 -right-12 size-64 rounded-full bg-primary/10 blur-[100px] opacity-70" />
            <div className="absolute bottom-0 left-10 size-48 rounded-full bg-emerald-500/5 blur-[80px] opacity-50" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                {currentStep === "video" ? (
                  <Video size={11} />
                ) : (
                  <Target size={11} />
                )}
                {currentStep === "video"
                  ? "Lecture Module"
                  : "Practice Lab"}
              </span>
              <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none">
                {data.topic.title}
              </h1>
              <p className="text-sm text-muted-foreground/90 max-w-2xl leading-relaxed font-medium">
                {data.topic.description || "No description formulated yet."}
              </p>
            </div>
            
            <div className="shrink-0 flex flex-col items-center sm:items-start rounded-2xl border border-border/60 dark:border-border/40 bg-background/50 px-6 py-4 shadow-md">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Reward Points
              </span>
              <span className="text-2xl font-[1000] text-primary mt-1.5">
                +{data.topic.xpVideoReward} XP
              </span>
            </div>
          </div>
        </m.section>

        {/* Content Tabs Body */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {currentStep === "video" ? (
              <m.div
                key="videoStep"
                initial={{opacity: 0, y: 15}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -15}}
                transition={{duration: 0.3}}
                className="space-y-6"
              >
                {/* Lecture Video Section */}
                <div className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/25 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-lg">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Lecture Module Video
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border/80">
                    {data.video ? (
                      <VideoPlayer
                        youtubeUrl={data.video.youtubeUrl}
                        initialSeekSeconds={data.progress.lastPositionSec}
                        onProgress={handleProgress}
                      />
                    ) : (
                      <div className="rounded-2xl border border-border/60 bg-muted py-16 text-center text-muted-foreground font-semibold">
                        Video not added yet.
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground/50">
                      <span>Progress watched</span>
                      <span className="text-primary font-black">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                    
                    <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-border/40 shadow-inner">
                      <div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300",
                          progressWidthClass(progressPct)
                        )}
                      />
                    </div>
                    
                    <p className="text-xs text-muted-foreground/85 font-medium leading-relaxed">
                      💡 Watch at least{" "}
                      <span className="font-extrabold text-primary">
                        {threshold}%
                      </span>{" "}
                      of the module to unlock the practice problems.
                    </p>
                  </div>

                  {!user && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 text-xs text-amber-500 leading-relaxed font-medium">
                      ⚠️ Sign in to save progress and unlock the problems tab.
                    </div>
                  )}
                </div>

                {/* Concept Focus Chips */}
                <div className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/25 p-6 md:p-8 space-y-4 backdrop-blur-xl shadow-lg">
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground/80">
                    Key Syllabus Areas
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {(data.topic.subtopics ?? []).length === 0 ? (
                      <span className="text-xs text-muted-foreground/50 italic font-medium">
                        No subtopics listed yet.
                      </span>
                    ) : (
                      (data.topic.subtopics ?? []).map((item) => (
                        <m.span
                          key={item}
                          whileHover={{scale: 1.02}}
                          className="inline-flex items-center gap-2 rounded-xl bg-background border border-border/60 hover:border-primary/45 px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-300"
                        >
                          <span className="size-1.5 rounded-full bg-primary" />
                          {item}
                        </m.span>
                      ))
                    )}
                  </div>
                </div>

                {/* Continue CTA */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("problems")}
                    disabled={!isNextUnlocked}
                    className={cn(
                      "h-12 px-8 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all duration-300",
                      isNextUnlocked
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:shadow-primary/25"
                        : "bg-muted text-muted-foreground border border-border opacity-50 cursor-not-allowed"
                    )}
                  >
                    Open Problems Sheet
                    {isNextUnlocked ? (
                      <ChevronRight className="size-4 ml-1.5" />
                    ) : (
                      <Lock className="size-4 ml-1.5" />
                    )}
                  </Button>
                </div>
              </m.div>
            ) : (
              <m.div
                key="problemsStep"
                initial={{opacity: 0, y: 15}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -15}}
                transition={{duration: 0.3}}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setCurrentStep("video")}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-emerald-500 transition duration-300"
                >
                  <ArrowLeft className="size-4" />
                  Back to Lecture Video
                </button>

                {/* Main Problem Sheet Card */}
                <div className="rounded-3xl border border-border/60 dark:border-border/40 bg-card/45 dark:bg-card/25 p-6 md:p-8 space-y-6 backdrop-blur-xl shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                      <Target className="size-5 text-primary" />
                      Problems Checklist
                    </div>

                    <div className="text-xs text-primary bg-primary/10 border border-primary/25 px-4 py-2.5 rounded-xl font-bold">
                      💡 Milestone Goal: Solve {data.level.sheetUnlockTopicPct}% to unlock next node
                    </div>
                  </div>

                  {/* Progress Stats */}
                  {data.sheet && (
                    <div className="space-y-3.5 p-5 rounded-2xl bg-background border border-border/60">
                      <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-muted-foreground/60">
                        <span>Sheet Completion</span>
                        <span className="text-primary font-bold">
                          {solvedCount} / {totalCount} Solved ({sheetPct}%)
                        </span>
                      </div>
                      
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden border border-border/40">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-500",
                            progressWidthClass(sheetPct)
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tip Notice */}
                  {data.sheet && (
                    <div className="rounded-2xl border border-border/60 bg-muted/40 p-5 space-y-1.5">
                      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
                        <CheckCircle2 className="size-4" />
                        Interactive Checklist Active
                      </div>
                      <p className="text-xs text-muted-foreground/80 max-w-3xl leading-relaxed font-medium">
                        Solve problems on Codeforces, then check them off here. You will immediately receive the corresponding XP rating points.
                      </p>
                    </div>
                  )}

                  {/* Codeforces Group Link */}
                  {data.sheet?.cfGroupUrl && (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
                        <ExternalLink className="size-4" />
                        Codeforces Practice Group
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                        Join the Codeforces group to practice and submit solutions for this sheet.
                      </p>
                      <a
                        href={data.sheet.cfGroupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline break-all"
                      >
                        {data.sheet.cfGroupUrl}
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                      {data.sheet.groupNote && (
                        <p className="text-[11px] text-muted-foreground/70 italic pt-1 border-t border-border/40 mt-2">
                          {data.sheet.groupNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Problems Table */}
                  {data.sheet && (
                    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/50">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow className="border-b border-border/60">
                            <TableHead className="w-14 text-center text-muted-foreground/60 font-black uppercase tracking-wider text-[10px]">
                              ✓
                            </TableHead>
                            <TableHead className="w-12 text-center text-muted-foreground/60 font-black uppercase tracking-wider text-[10px]">
                              #
                            </TableHead>
                            <TableHead className="text-muted-foreground/60 font-black uppercase tracking-wider text-[10px]">
                              Problem
                            </TableHead>
                            <TableHead className="text-muted-foreground/60 font-black uppercase tracking-wider text-[10px]">
                              XP Value
                            </TableHead>
                            <TableHead className="w-32 text-right text-muted-foreground/60 font-black uppercase tracking-wider text-[10px] pr-6">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.problems.map((problem, index) => {
                            const isSolved = Boolean(
                              data.progress?.problemProgress?.[problem._id]
                            );
                            const isToggling = togglingIds.has(problem._id);
                            return (
                              <TableRow
                                key={problem._id}
                                className="group border-b border-border/40 hover:bg-primary/[0.02] transition-all duration-205"
                              >
                                <TableCell className="text-center py-4">
                                  <button
                                    type="button"
                                    disabled={isToggling || !user}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleProblem(problem._id, isSolved);
                                    }}
                                    className={cn(
                                      "size-5 rounded-md border flex items-center justify-center transition-all duration-300 cursor-pointer",
                                      isToggling && "opacity-50 cursor-wait animate-pulse",
                                      isSolved
                                        ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/10"
                                        : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                                    )}
                                  >
                                    {isSolved && <Check size={12} strokeWidth={3} />}
                                  </button>
                                </TableCell>
                                
                                <TableCell className="text-center font-mono text-xs text-muted-foreground/50 py-4">
                                  {index + 1}
                                </TableCell>
                                
                                <TableCell className="py-4">
                                  <button
                                    type="button"
                                    className="flex items-center gap-1.5 text-left cursor-pointer group/link"
                                    onClick={() =>
                                      window.open(
                                        getCodeforcesUrl(problem.cfProblemId),
                                        "_blank"
                                      )
                                    }
                                  >
                                    <span className={cn(
                                      "font-bold text-xs transition-colors duration-300 group-hover/link:text-primary",
                                      isSolved ? "text-muted-foreground/50 line-through" : "text-foreground"
                                    )}>
                                      {getProblemDisplayName(problem)}
                                    </span>
                                    <ExternalLink className="size-3.5 text-muted-foreground/35 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
                                  </button>
                                </TableCell>
                                
                                <TableCell className="font-black text-primary text-xs py-4">
                                  +{problem.xpReward} XP
                                </TableCell>
                                
                                <TableCell className="text-right py-4 pr-6">
                                  {isSolved ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/15 uppercase tracking-wider">
                                      Solved
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-muted-foreground/60 bg-muted/65 px-2.5 py-0.5 rounded border border-border uppercase tracking-wider">
                                      Unsolved
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Info Footer */}
                  {!user && (
                    <div className="mt-6 pt-5 border-t border-border/40">
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3.5 text-xs text-amber-500 leading-relaxed font-medium">
                        ⚠️ Sign in to track your progress and earn XP.
                      </div>
                    </div>
                  )}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;

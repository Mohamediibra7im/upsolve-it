"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Video,
  ExternalLink,
  Check,
  Globe,
  Play,
  FileText,
  BookOpen,
  RefreshCw,
  GraduationCap,
  Layers,
  Loader2,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import { useRoadmapTopic, useRoadmapLevel, useRoadmapUserSummary } from "@/hooks/roadmap/useRoadmap";
import { VideoPlayer } from "@/components/features/roadmap";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";
import { useUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import type { ToggleProblemResult } from "@/types/Roadmap";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const LanguageChoice = ({ onSelect }: { onSelect: (lang: "Arabic" | "English") => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center py-12 gap-8 font-mono text-emerald-400"
  >
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
        <GraduationCap size={12} className="text-emerald-400" />
        <span>CURRICULUM_SELECTION // PATH_INITIALIZATION</span>
      </div>
      <h2 className="text-lg font-bold text-emerald-300 uppercase tracking-wider">
        Select Training Channel Path
      </h2>
      <p className="text-[11px] text-emerald-500/40 max-w-sm mx-auto leading-relaxed">
        Choose your primary tutorial feed type. Switching channels later will flush cached progress on this topic sector.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
      <button
        onClick={() => onSelect("Arabic")}
        className="group relative flex flex-col gap-4 rounded border border-emerald-500/15 bg-emerald-950/5 hover:border-emerald-500/35 transition-all duration-200 p-5 text-left cursor-pointer"
      >
        <div className="size-10 rounded border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 shrink-0">
          <Video size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-emerald-300 uppercase">Arabic Video Channel</h3>
          <p className="text-[10px] text-emerald-500/40 leading-relaxed">
            Automatic watch time calculation based on video lectures.
          </p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300 transition-colors">
          [ START_PATH.EXE ]
        </span>
      </button>

      <button
        onClick={() => onSelect("English")}
        className="group relative flex flex-col gap-4 rounded border border-emerald-500/15 bg-emerald-950/5 hover:border-emerald-500/35 transition-all duration-200 p-5 text-left cursor-pointer"
      >
        <div className="size-10 rounded border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 shrink-0">
          <Globe size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-emerald-300 uppercase">English Reading Channel</h3>
          <p className="text-[10px] text-emerald-500/40 leading-relaxed">
            Articles, documentation sheets, and manual checkoff listings.
          </p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300 transition-colors">
          [ START_PATH.EXE ]
        </span>
      </button>
    </div>
  </motion.div>
);

export default function TopicPage() {
  const params = useParams<{ id: string; topicId: string }>();
  const levelId = params?.id;
  const topicId = params?.topicId;
  const { data: levelData, mutate: mutateLevel } = useRoadmapLevel(levelId);
  const { toast } = useToast();
  const { user } = useUser();

  const [currentStep, setCurrentStep] = useState<"learning" | "problems">("learning");
  const [selectedLanguage, setSelectedLanguage] = useState<"Arabic" | "English" | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(`topic-lang-${topicId}`);
    if (saved === "Arabic" || saved === "English") return saved;
    return null;
  });
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [togglingResourceIds, setTogglingResourceIds] = useState<Set<string>>(new Set());
  const [togglingProblemIds, setTogglingProblemIds] = useState<Set<string>>(new Set());
  const [isSwitchLangConfirmOpen, setIsSwitchLangConfirmOpen] = useState(false);
  const [pendingLangSwitch, setPendingLangSwitch] = useState<"Arabic" | "English" | null>(null);
  const [isCompletingLearning, setIsCompletingLearning] = useState(false);

  const { data, isLoading, error, mutate } = useRoadmapTopic(levelId, topicId, selectedLanguage ?? undefined);
  const { mutateSummary } = useRoadmapUserSummary(!!user);

  const handleSelectLanguage = (lang: "Arabic" | "English") => {
    setSelectedLanguage(lang);
    localStorage.setItem(`topic-lang-${topicId}`, lang);
  };

  const lastSentRef = useRef<Record<string, number>>({});

  const _arabicResources = useMemo(() => (data?.resources ?? []).filter((r) => r.language === "Arabic"), [data]);
  const englishResources = useMemo(() => (data?.resources ?? []).filter((r) => r.language === "English"), [data]);
  const videoResources = useMemo(() => (data?.resources ?? []).filter((r) => r.type === "Video" && r.language === "Arabic"), [data]);
  const arabicNonVideoResources = useMemo(() => (data?.resources ?? []).filter((r) => r.language === "Arabic" && r.type !== "Video"), [data]);

  useEffect(() => {
    if (videoResources.length > 0 && !activeVideoId) setActiveVideoId(videoResources[0]._id);
  }, [videoResources, activeVideoId]);

  const activeVideo = useMemo(() => videoResources.find((v) => v._id === activeVideoId) || null, [videoResources, activeVideoId]);
  const activeVideoProgress = useMemo(() => {
    if (!activeVideoId || !data?.progress?.resourceProgress) return null;
    return data.progress.resourceProgress[activeVideoId] || { watchPct: 0, lastPositionSec: 0 };
  }, [activeVideoId, data?.progress?.resourceProgress]);

  const learningPct = data?.progress?.learningPct ?? 0;
  const isProblemsUnlocked = learningPct >= (data?.topic?.requiredLearningPct ?? 80);

  const solvedCount = useMemo(() => {
    if (!data?.problems || !data?.progress?.problemProgress) return 0;
    return data.problems.filter((p) => data.progress.problemProgress[p._id]).length;
  }, [data?.problems, data?.progress?.problemProgress]);

  const totalCount = data?.problems?.length ?? 0;
  const problemPct = data?.progress?.problemPct ?? 0;

  const handleVideoProgress = useCallback(
    async (resourceId: string, payload: { currentTime: number; duration: number; percent: number }) => {
      if (!user) return;
      const now = Date.now();
      const lastSent = lastSentRef.current[resourceId] ?? 0;
      if (now - lastSent < 5000) return;
      lastSentRef.current[resourceId] = now;
      try {
        const res = await apiClient.post<any>(`/api/roadmap/resources/${resourceId}/progress`, {
          watchPct: Math.round(payload.percent),
          positionSec: Math.floor(payload.currentTime),
        });
        mutate((current) => {
          if (!current) return current;
          const resourceProgress = { ...current.progress.resourceProgress };
          resourceProgress[resourceId] = {
            ...resourceProgress[resourceId],
            watchPct: res.watchPct ?? Math.round(payload.percent),
            lastPositionSec: res.lastPositionSec ?? Math.floor(payload.currentTime),
            isCompleted: res.isCompleted ?? resourceProgress[resourceId]?.isCompleted ?? false,
          };
          return { ...current, progress: { ...current.progress, learningPct: res.learningPct ?? current.progress.learningPct, isTopicComplete: res.isTopicComplete ?? current.progress.isTopicComplete, resourceProgress } };
        }, false);
        if ((res.xpEarned ?? 0) > 0) mutateSummary();
      } catch { /* silent */ }
    },
    [user, mutate, mutateSummary]
  );

  const handleToggleResource = useCallback(async (resourceId: string, currentlyCompleted: boolean) => {
    if (!user || togglingResourceIds.has(resourceId)) return;
    const newCompleted = !currentlyCompleted;
    setTogglingResourceIds((prev) => new Set(prev).add(resourceId));
    mutate((current) => {
      if (!current) return current;
      const resourceProgress = { ...current.progress.resourceProgress };
      resourceProgress[resourceId] = { ...resourceProgress[resourceId], watchPct: newCompleted ? 100 : 0, lastPositionSec: 0, isCompleted: newCompleted };
      const resources = current.resources ?? [];
      let totalContribution = 0;
      for (const res of resources) {
        const prog = resourceProgress[res._id];
        if (!prog) continue;
        if (res.type === "Video") totalContribution += res.weight * ((prog.watchPct ?? 0) / 100);
        else if (prog.isCompleted) totalContribution += res.weight;
      }
      const newLearningPct = resources.length > 0 ? Math.min(100, Math.round(totalContribution)) : 100;
      return { ...current, progress: { ...current.progress, learningPct: newLearningPct, resourceProgress } };
    }, false);
    try {
      const res = await apiClient.post<any>(`/api/roadmap/resources/${resourceId}/progress`, { completed: newCompleted });
      const xp = res.xpEarned ?? 0;
      toast({
        title: newCompleted ? "Resource Completed!" : "Progress Cleared",
        description: newCompleted && xp > 0 ? `Earned +${xp} XP!` : !newCompleted && xp < 0 ? `Lost ${Math.abs(xp)} XP` : "Progress updated.",
        variant: newCompleted ? "success" : "default",
      });
      mutate((current) => {
        if (!current || res.learningPct === undefined) return current;
        return { ...current, progress: { ...current.progress, learningPct: res.learningPct } };
      }, false);
      mutateLevel();
      mutateSummary();
    } catch (err: any) {
      mutate();
      toast({ title: "Update Failed", description: err.message || "Failed to update resource.", variant: "destructive" });
    } finally {
      setTogglingResourceIds((prev) => { const next = new Set(prev); next.delete(resourceId); return next; });
    }
  }, [user, togglingResourceIds, mutate, mutateLevel, mutateSummary, toast]);

  const handleToggleProblem = useCallback(async (problemId: string, currentlySolved: boolean) => {
    if (!user || togglingProblemIds.has(problemId)) return;
    const newSolved = !currentlySolved;
    setTogglingProblemIds((prev) => new Set(prev).add(problemId));
    mutate((current) => {
      if (!current) return current;
      const problemProgress = { ...current.progress.problemProgress };
      problemProgress[problemId] = newSolved;
      const total = current.problems?.length ?? 0;
      const solved = Object.values(problemProgress).filter(Boolean).length;
      const problemPct = total > 0 ? Math.round((solved / total) * 100) : 0;
      return { ...current, progress: { ...current.progress, problemProgress, problemPct } };
    }, false);
    try {
      const res = await apiClient.post<ToggleProblemResult>(`/api/roadmap/problems/${problemId}/toggle`, { solved: newSolved, language: selectedLanguage });
      const xp = res.xpDelta ?? 0;
      toast({
        title: newSolved ? "Problem Solved!" : "Problem Unmarked",
        description: newSolved && xp > 0 ? `Earned +${xp} XP!` : !newSolved && xp < 0 ? `Lost ${Math.abs(xp)} XP` : "Progress updated.",
        variant: newSolved ? "success" : "default",
      });
      mutate(); mutateLevel(); mutateSummary();
    } catch (err: any) {
      mutate();
      toast({ title: "Update Failed", description: err.message || "Could not update problem status.", variant: "destructive" });
    } finally {
      setTogglingProblemIds((prev) => { const next = new Set(prev); next.delete(problemId); return next; });
    }
  }, [user, togglingProblemIds, selectedLanguage, mutate, mutateLevel, mutateSummary, toast]);

  const handleCompleteLearning = useCallback(async () => {
    if (!user || isCompletingLearning) return;
    setIsCompletingLearning(true);
    mutate((current) => {
      if (!current) return current;
      return { ...current, progress: { ...current.progress, learningPct: 100 } };
    }, false);
    try {
      const res = await apiClient.post<{ ok: boolean; xpEarned: number; learningPct: number }>(
        `/api/roadmap/topics/${topicId}/complete-learning${selectedLanguage ? `?language=${selectedLanguage}` : ""}`
      );
      const xp = res.xpEarned ?? 0;
      toast({
        title: "Learning Complete!",
        description: xp > 0 ? `Earned +${xp} XP!` : "All resources marked as complete.",
        variant: "success",
      });
      mutate(); mutateLevel(); mutateSummary();
    } catch (err: any) {
      mutate();
      toast({ title: "Failed", description: err.message || "Could not complete learning.", variant: "destructive" });
    } finally {
      setIsCompletingLearning(false);
    }
  }, [user, isCompletingLearning, topicId, selectedLanguage, mutate, mutateLevel, mutateSummary, toast]);

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-emerald-400">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">[SYS.ERR // LOAD_FAILURE]</p>
          <p className="text-[11px] text-emerald-500/50">{error}</p>
          <button type="button" onClick={() => mutate()} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300">[ TRY_AGAIN.SH ]</button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) return <Loader message="Loading topic..." />;

  const problemsList = data.problems ?? [];

  const groupLinks = (() => {
    const raw = data.topic?.groupLinks;
    const str = Array.isArray(raw) ? raw.map((g: any) => g?.link ?? g?.toString() ?? "").filter(Boolean).join("\n") : typeof raw === "string" ? raw : "";
    return str.split("\n").map((l: string) => l.trim()).filter(Boolean);
  })();

  const resourceTypeIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video className="size-3 text-amber-400" />;
      case "Article": return <FileText className="size-3 text-sky-400" />;
      case "Documentation": return <FileText className="size-3 text-blue-400" />;
      case "Tutorial": return <Play className="size-3 text-violet-400" />;
      case "Course": return <BookOpen className="size-3 text-emerald-400" />;
      case "PDF": return <FileText className="size-3 text-orange-400" />;
      case "Website": return <Globe className="size-3 text-teal-400" />;
      default: return <ExternalLink className="size-3 text-emerald-500/30" />;
    }
  };

  // Progress readouts
  const totalBlocks = 10;
  const learnBlocks = Math.min(totalBlocks, Math.round((learningPct / 100) * totalBlocks));
  const probBlocks = Math.min(totalBlocks, Math.round((problemPct / 100) * totalBlocks));

  return (
    <div className="min-h-screen pb-20 relative font-mono text-emerald-400">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-6">

        {/* ── TOP NAV ── */}
        <div className="flex items-center justify-end py-4 gap-4">
          {/* Step tabs */}
          {selectedLanguage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep("learning")}
                className={cn(
                  "h-9 px-4 rounded border font-bold uppercase tracking-widest text-[9px] transition-all duration-200 font-mono",
                  currentStep === "learning"
                    ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "bg-transparent border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
                )}
              >
                [ LEARN.SH ]
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isProblemsUnlocked) setCurrentStep("problems");
                  else toast({ title: "Locked", description: `Reach ${data.topic.requiredLearningPct}% learning first.`, variant: "destructive" });
                }}
                className={cn(
                  "h-9 px-4 rounded border font-bold uppercase tracking-widest text-[9px] transition-all duration-200 font-mono",
                  currentStep === "problems"
                    ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "bg-transparent border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40",
                  !isProblemsUnlocked && "opacity-40 cursor-not-allowed"
                )}
              >
                [ PRACTICE.EXE ]
              </button>
            </div>
          )}
        </div>

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Layers size={12} className="text-emerald-400" />
            <span>MISSION_STATION // DATA_STREAM_BRIEFING</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            {selectedLanguage && (
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                selectedLanguage === "Arabic"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-sky-500/10 border-sky-500/20 text-sky-400"
              )}>
                {selectedLanguage} Path
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider leading-none">
                {data.topic.title}
              </h1>
              {data.topic.description && (
                <p className="text-[11px] text-emerald-500/40 max-w-2xl leading-relaxed">
                  {data.topic.description}
                </p>
              )}
              {data.topic.subtopics && data.topic.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.topic.subtopics.map((sub: string) => (
                    <span key={sub} className="text-[9px] font-bold text-emerald-500/30 uppercase">
                      [{sub}]
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: stats readouts */}
            <div className="flex flex-row lg:flex-col gap-4 shrink-0">
              {/* Reward readout */}
              <div className="py-2 px-3 border-b border-emerald-500/10">
                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/45 block">XP_REWARD</span>
                <span className="text-lg font-bold text-emerald-300 tabular-nums">+{data.topic.topicXpReward} XP</span>
              </div>

              {/* Progress info */}
              {selectedLanguage && (
                <div className="py-2 px-3 border-b border-emerald-500/10">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/45 block">LEARN_RATIO</span>
                  <span className="text-lg font-bold text-emerald-300 tabular-nums">{Math.round(learningPct)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Block Meters */}
          {selectedLanguage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-emerald-500/10">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-emerald-500/45">
                  <span>LEARNING_PROGRESS</span>
                  <span className="font-bold text-emerald-300">{Math.round(learningPct)}%</span>
                </div>
                <div className="text-[10px] tabular-nums flex items-center">
                  <span className="text-emerald-500/30">[</span>
                  <span className="text-emerald-400">{"█".repeat(learnBlocks)}</span>
                  <span className="text-emerald-500/15">{"░".repeat(10 - learnBlocks)}</span>
                  <span className="text-emerald-500/30">]</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] text-emerald-500/45">
                  <span>PRACTICE_COMPLETION</span>
                  <span className="font-bold text-emerald-300">
                    {isProblemsUnlocked ? `${solvedCount}/${totalCount} solved` : "LOCKED"}
                  </span>
                </div>
                <div className="text-[10px] tabular-nums flex items-center">
                  {isProblemsUnlocked ? (
                    <>
                      <span className="text-emerald-500/30">[</span>
                      <span className="text-emerald-400">{"█".repeat(probBlocks)}</span>
                      <span className="text-emerald-500/15">{"░".repeat(10 - probBlocks)}</span>
                      <span className="text-emerald-500/30">]</span>
                    </>
                  ) : (
                    <span className="text-emerald-500/20">[░░░░░░░░░░]</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <AnimatePresence mode="wait">
          {selectedLanguage === null ? (
            <LanguageChoice key="langChoice" onSelect={handleSelectLanguage} />
          ) : currentStep === "learning" ? (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Path Switcher status bar */}
              <div className="flex items-center justify-between py-2.5 px-4 border border-emerald-500/10 bg-emerald-950/5 rounded">
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="font-bold text-emerald-500/45 uppercase">ACTIVE_PATH //</span>
                  <span className="font-bold text-emerald-300 uppercase">{selectedLanguage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPendingLangSwitch(selectedLanguage === "Arabic" ? "English" : "Arabic"); setIsSwitchLangConfirmOpen(true); }}
                  className="h-7 px-3 rounded border border-emerald-500/20 bg-transparent text-emerald-500/60 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-500/10 hover:text-emerald-300 transition-all font-mono inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={9} />
                  [ SWITCH_PATH.COM ]
                </button>
              </div>

              {/* ── ARABIC LEARNING (VIDEO WORKSPACE) ── */}
              {selectedLanguage === "Arabic" && (
                <div className="space-y-6">
                  {videoResources.length > 1 ? (
                    <div className="grid lg:grid-cols-3 gap-6">
                      {/* Video Player Box */}
                      <div className="lg:col-span-2 space-y-4">
                        {activeVideo ? (
                          <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-[#081210]">
                              <span className="text-[9px] font-bold text-emerald-400 truncate max-w-md">
                                {activeVideo.title.toUpperCase()}
                              </span>
                              {activeVideoProgress?.isCompleted && (
                                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">[ WATCHED ]</span>
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <VideoPlayer
                                youtubeUrl={activeVideo.url}
                                initialSeekSeconds={activeVideoProgress?.lastPositionSec ?? 0}
                                onProgress={(payload) => handleVideoProgress(activeVideo._id, payload)}
                              />
                            </div>
                            {/* Watch progress */}
                            <div className="p-4 border-t border-emerald-500/10 bg-emerald-950/5">
                              <div className="flex items-center justify-between text-[9px] text-emerald-500/40 mb-1">
                                <span>WATCH_RATIO</span>
                                <span>{activeVideoProgress?.watchPct ?? 0}%</span>
                              </div>
                              <div className="text-[9px] tabular-nums flex items-center">
                                <span className="text-emerald-500/30">[</span>
                                <span className="text-emerald-400">
                                  {"█".repeat(Math.min(10, Math.round((activeVideoProgress?.watchPct ?? 0) / 10)))}
                                </span>
                                <span className="text-emerald-500/15">
                                  {"░".repeat(10 - Math.min(10, Math.round((activeVideoProgress?.watchPct ?? 0) / 10)))}
                                </span>
                                <span className="text-emerald-500/30">]</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 border border-emerald-500/15 bg-emerald-950/5 text-center text-emerald-500/20 text-xs">
                            [SYS.ERR // NO VIDEO STREAM LOCATED]
                          </div>
                        )}
                      </div>

                      {/* Playlist Sidebar */}
                      <div className="space-y-4">
                        <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                          <div className="px-4 py-2.5 border-b border-emerald-500/10 bg-emerald-950/5">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">LECTURE_PLAYLIST</span>
                            <span className="text-[8px] text-emerald-500/30 uppercase">{videoResources.length} sections logged</span>
                          </div>
                          <div className="divide-y divide-emerald-500/[0.07] max-h-[320px] overflow-y-auto">
                            {videoResources.map((v, idx) => {
                              const vProg = data.progress?.resourceProgress?.[v._id];
                              const isActive = v._id === activeVideoId;
                              return (
                                <button
                                  key={v._id}
                                  type="button"
                                  onClick={() => setActiveVideoId(v._id)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-xs font-mono",
                                    isActive ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-300" : "hover:bg-emerald-950/5 border-l-2 border-l-transparent text-emerald-500/60"
                                  )}
                                >
                                  <span className="shrink-0 text-[9px] font-bold">
                                    {vProg?.isCompleted ? "[✓]" : `[${String(idx + 1).padStart(2, "0")}]`}
                                  </span>
                                  <span className="truncate leading-tight flex-1">
                                    {v.title}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Video layout */
                    <div className="space-y-4">
                      {activeVideo ? (
                        <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-[#081210]">
                            <span className="text-[9px] font-bold text-emerald-400 truncate max-w-md">
                              {activeVideo.title.toUpperCase()}
                            </span>
                            {activeVideoProgress?.isCompleted && (
                              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">[ WATCHED ]</span>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <VideoPlayer
                              youtubeUrl={activeVideo.url}
                              initialSeekSeconds={activeVideoProgress?.lastPositionSec ?? 0}
                              onProgress={(payload) => handleVideoProgress(activeVideo._id, payload)}
                            />
                          </div>
                          <div className="p-4 border-t border-emerald-500/10 bg-emerald-950/5">
                            <div className="flex items-center justify-between text-[9px] text-emerald-500/40 mb-1">
                              <span>WATCH_RATIO</span>
                              <span>{activeVideoProgress?.watchPct ?? 0}%</span>
                            </div>
                            <div className="text-[9px] tabular-nums flex items-center">
                              <span className="text-emerald-500/30">[</span>
                              <span className="text-emerald-400">
                                {"█".repeat(Math.min(10, Math.round((activeVideoProgress?.watchPct ?? 0) / 10)))}
                              </span>
                              <span className="text-emerald-500/15">
                                {"░".repeat(10 - Math.min(10, Math.round((activeVideoProgress?.watchPct ?? 0) / 10)))}
                              </span>
                              <span className="text-emerald-500/30">]</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 border border-emerald-500/15 bg-emerald-950/5 text-center text-emerald-500/20 text-xs">
                          [SYS.ERR // NO VIDEO STREAM LOCATED]
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extra Materials Checklist */}
                  {arabicNonVideoResources.length > 0 && (
                    <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3.5 border-b border-emerald-500/10 bg-emerald-950/5">
                        <div>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">EXTRA_MATERIALS</span>
                          <span className="text-[8px] text-emerald-500/30 uppercase">{arabicNonVideoResources.length} items logged</span>
                        </div>
                        <span className="text-[9px] text-emerald-400 uppercase tracking-wider">
                          {arabicNonVideoResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{arabicNonVideoResources.length} completed
                        </span>
                      </div>
                      <div className="divide-y divide-emerald-500/[0.07]">
                        {arabicNonVideoResources.map((res, idx) => {
                          const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                          const isToggling = togglingResourceIds.has(res._id);
                          return (
                            <div key={res._id} className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", rProg.isCompleted && "bg-emerald-500/[0.02]")}>
                              <span className="text-[10px] text-emerald-500/20 w-6 shrink-0 text-center">{String(idx + 1).padStart(2, "0")}</span>
                              <div className="shrink-0 size-8 rounded border border-emerald-500/10 bg-emerald-950/10 flex items-center justify-center">
                                {resourceTypeIcon(res.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("font-bold transition-colors inline-flex items-center gap-1.5", rProg.isCompleted ? "text-emerald-500/30 line-through" : "text-emerald-300 hover:text-emerald-200")}>
                                  {res.title}
                                  <ExternalLink size={9} className="opacity-40" />
                                </a>
                                <div className="flex items-center gap-2 mt-0.5 text-[8px] text-emerald-500/30 uppercase">
                                  <span>{res.type}</span>
                                  {res.weight === 0 && <span className="text-emerald-500/20 border border-emerald-500/10 px-1 rounded">[OPTIONAL]</span>}
                                </div>
                              </div>
                              <span className="shrink-0 text-[9px] text-emerald-500/40 mr-2">
                                +{res.xpReward} XP
                              </span>
                              <button
                                type="button"
                                disabled={isToggling || !user}
                                onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                                className={cn("shrink-0 size-6 rounded border flex items-center justify-center transition-all", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-emerald-500 border-emerald-500 text-emerald-950" : "border-emerald-500/20 bg-[#060a08] hover:border-emerald-500/40")}
                              >
                                {rProg.isCompleted && <Check size={12} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ENGLISH LEARNING (READING WORKSPACE) ── */}
              {selectedLanguage === "English" && (
                <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-emerald-500/10 bg-emerald-950/5">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">READING_CHECKLIST</span>
                      <span className="text-[8px] text-emerald-500/30 uppercase">{englishResources.length} items logged</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 uppercase tracking-wider">
                      {englishResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{englishResources.length} completed
                    </span>
                  </div>

                  {englishResources.length === 0 ? (
                    <div className="py-12 text-center text-emerald-500/20 text-xs">
                      [SYS.EMPTY // NO READING RESOURCES DEFINED]
                    </div>
                  ) : (
                    <div className="divide-y divide-emerald-500/[0.07]">
                      {englishResources.map((res, idx) => {
                        const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                        const isToggling = togglingResourceIds.has(res._id);
                        return (
                          <div key={res._id} className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", rProg.isCompleted && "bg-emerald-500/[0.02]")}>
                            <span className="text-[10px] text-emerald-500/20 w-6 shrink-0 text-center">{String(idx + 1).padStart(2, "0")}</span>
                            <div className="shrink-0 size-8 rounded border border-emerald-500/10 bg-emerald-950/10 flex items-center justify-center">
                              {resourceTypeIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("font-bold transition-colors inline-flex items-center gap-1.5", rProg.isCompleted ? "text-emerald-500/30 line-through" : "text-emerald-300 hover:text-emerald-200")}>
                                {res.title}
                                <ExternalLink size={9} className="opacity-40" />
                              </a>
                              <div className="flex items-center gap-2 mt-0.5 text-[8px] text-emerald-500/30 uppercase">
                                <span>{res.type}</span>
                                {res.weight === 0 && <span className="text-emerald-500/20 border border-emerald-500/10 px-1 rounded">[OPTIONAL]</span>}
                              </div>
                            </div>
                            <span className="shrink-0 text-[9px] text-emerald-500/40 mr-2">
                              +{res.xpReward} XP
                            </span>
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                              className={cn("shrink-0 size-6 rounded border flex items-center justify-center transition-all", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-emerald-500 border-emerald-500 text-emerald-950" : "border-emerald-500/20 bg-[#060a08] hover:border-emerald-500/40")}
                            >
                              {rProg.isCompleted && <Check size={12} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Gated triggers at end of Learn step */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border border-emerald-500/10 bg-emerald-950/5 rounded">
                <span className="text-[10px] text-emerald-500/45 uppercase tracking-wider">
                  {isProblemsUnlocked
                    ? "[✓ TASK_STATE // PRACTICE_READY]"
                    : `[ LOCKED // COMPILATION REQ: ${data.topic.requiredLearningPct}% LEARNING ]`
                  }
                </span>

                <div className="flex items-center gap-3">
                  {isProblemsUnlocked && learningPct < 100 && selectedLanguage === "Arabic" && (
                    <Button
                      type="button"
                      onClick={handleCompleteLearning}
                      disabled={isCompletingLearning}
                      className="h-8 px-4 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-400 font-mono inline-flex items-center"
                    >
                      {isCompletingLearning ? (
                        <Loader2 size={10} className="animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 size={10} className="mr-1" />
                      )}
                      [ COMPLETE.EXE ]
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => { if (isProblemsUnlocked) setCurrentStep("problems"); }}
                    disabled={!isProblemsUnlocked}
                    className={cn(
                      "h-8 px-4 rounded font-bold uppercase tracking-widest text-[8px] transition-all font-mono",
                      isProblemsUnlocked
                        ? "bg-emerald-500 text-emerald-950 border-emerald-500 hover:bg-emerald-400"
                        : "bg-transparent border-emerald-500/10 text-emerald-500/20 cursor-not-allowed"
                    )}
                  >
                    {isProblemsUnlocked ? "[ OPEN_PRACTICE.EXE ]" : "[ LOCKED.SYS ]"}
                  </Button>
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── PRACTICE STEP (PROBLEMS MATRIX) ── */
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {!isProblemsUnlocked ? (
                <div className="py-12 border border-emerald-500/15 bg-emerald-950/5 text-center space-y-4">
                  <div className="size-10 rounded border border-emerald-500/10 flex items-center justify-center text-emerald-500/30 mx-auto">
                    <Lock size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-300 uppercase">Practice Sector Locked</h3>
                  <p className="text-[11px] text-emerald-500/40 max-w-sm mx-auto">
                    Complete at least {data.topic.requiredLearningPct}% of the learning feeds to compile problems. (Current: {Math.round(learningPct)}%)
                  </p>
                  <Button type="button" onClick={() => setCurrentStep("learning")} className="h-8 px-4 rounded border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-500/10 font-mono">
                    [ GO_TO_LEARNING.SH ]
                  </Button>
                </div>
              ) : (
                <div className="rounded border border-emerald-500/15 bg-[#060a08]/30 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/10 bg-emerald-950/5">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">PRACTICE_PROBLEMS_LOG</span>
                      <span className="text-[8px] text-emerald-500/30 uppercase">
                        Resolve {data.topic.requiredProblemPct}% of targets
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-emerald-500/30 uppercase block">RESOLVED</span>
                      <span className="text-xs font-bold text-emerald-300 tabular-nums">
                        {solvedCount}/{totalCount}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 py-2.5 border-b border-emerald-500/10 bg-emerald-950/5">
                    <div className="flex items-center justify-between text-[9px] text-emerald-500/40 mb-1">
                      <span>COMPLETION_RATIO</span>
                      <span className={problemPct >= (data.topic.requiredProblemPct ?? 60) ? "text-emerald-400" : "text-emerald-300"}>
                        {Math.round(problemPct)}%
                      </span>
                    </div>
                    <div className="text-[10px] tabular-nums flex items-center">
                      <span className="text-emerald-500/30">[</span>
                      <span className="text-emerald-400">{"█".repeat(probBlocks)}</span>
                      <span className="text-emerald-500/15">{"░".repeat(10 - probBlocks)}</span>
                      <span className="text-emerald-500/30">]</span>
                    </div>
                  </div>

                  {/* Codeforces Group links */}
                  {groupLinks.length > 0 && (
                    <div className="px-4 py-3 border-b border-emerald-500/10 bg-emerald-950/5 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-emerald-500/45 uppercase tracking-wider block">CODEFORCES_GROUP_RESOURCES</span>
                        {groupLinks.map((link: string, i: number) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold text-emerald-300 hover:text-emerald-200 transition-colors">
                            {link} <ExternalLink size={9} className="opacity-40" />
                          </a>
                        ))}
                        {data.topic?.groupNote && <p className="text-[9px] text-emerald-500/30 italic mt-1">{data.topic.groupNote}</p>}
                      </div>
                    </div>
                  )}

                  {/* Problems checklist */}
                  {problemsList.length === 0 ? (
                    <div className="py-12 text-center text-emerald-500/20 text-xs">
                      [SYS.EMPTY // NO PRACTICE CHALLENGE NODES DEPLOYED]
                    </div>
                  ) : (
                    <div className="divide-y divide-emerald-500/[0.07]">
                      {problemsList.map((prob, index) => {
                        const isSolved = Boolean(data.progress?.problemProgress?.[prob._id]);
                        const isToggling = togglingProblemIds.has(prob._id);
                        return (
                          <div
                            key={prob._id}
                            className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", isSolved && "bg-emerald-500/[0.02]")}
                          >
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              onClick={() => handleToggleProblem(prob._id, isSolved)}
                              className={cn("shrink-0 size-6 rounded border flex items-center justify-center transition-all", isToggling && "opacity-50 cursor-wait animate-pulse", isSolved ? "bg-emerald-500 border-emerald-500 text-emerald-950" : "border-emerald-500/20 bg-[#060a08] hover:border-emerald-500/40")}
                            >
                              {isSolved && <Check size={12} />}
                            </button>

                            <span className="text-[10px] text-emerald-500/20 w-6 shrink-0 text-center">{String(prob.orderIndex ?? index + 1).padStart(2, "0")}</span>

                            <div className="flex-1 min-w-0">
                              <a
                                href={prob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn("font-bold transition-colors inline-flex items-center gap-1.5", isSolved ? "text-emerald-500/30 line-through" : "text-emerald-300 hover:text-emerald-200")}
                              >
                                {prob.name}
                                <ExternalLink size={9} className="opacity-40" />
                              </a>
                            </div>

                            <span className={cn("shrink-0 text-[9px] font-bold px-2 py-0.5 rounded border mr-2", isSolved ? "border-emerald-500/20 text-emerald-500/40" : "border-primary/20 text-primary")}>
                              +{prob.xpReward} XP
                            </span>

                            <span className={cn("shrink-0 hidden sm:inline text-[9px] font-bold uppercase", isSolved ? "text-emerald-400" : "text-emerald-500/30")}>
                              {isSolved ? "[RESOLVED]" : "[PENDING]"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Next topic trigger */}
                  {levelData?.topics && (() => {
                    const idx = levelData.topics.findIndex((t) => t._id === topicId);
                    const next = idx !== -1 ? levelData.topics[idx + 1] : null;
                    if (!next) return null;
                    const reqLearning = data.topic.requiredLearningPct ?? 80;
                    const reqProblem = data.topic.requiredProblemPct ?? 60;
                    const canProceed = learningPct >= reqLearning && problemPct >= reqProblem;
                    return (
                      <div className="flex justify-end px-4 py-3 border-t border-emerald-500/10 bg-emerald-950/5">
                        {canProceed ? (
                          <Link
                            href={`/roadmap/levels/${levelId}/topics/${next._id}`}
                            className="h-8 px-4 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-400 transition-all font-mono inline-flex items-center"
                          >
                            [ NEXT_MISSION: {next.title.toUpperCase()} ]
                          </Link>
                        ) : (
                          <span
                            className="h-8 px-4 rounded border border-emerald-500/5 text-emerald-500/20 text-[8px] font-bold uppercase tracking-widest inline-flex items-center select-none cursor-not-allowed"
                            title={`Need ${reqLearning}% learning and ${reqProblem}% problem progress`}
                          >
                            [ LOCKED: LRN {Math.round(learningPct)}/{reqLearning}% · PRB {Math.round(problemPct)}/{reqProblem}% ]
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Switch Language Dialog */}
      <Dialog open={isSwitchLangConfirmOpen} onOpenChange={setIsSwitchLangConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#060a08] border border-emerald-500/25 rounded p-0 overflow-hidden font-mono text-emerald-400">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center size-10 rounded border border-amber-500/25 bg-amber-950/10 mx-auto mb-4">
              <RefreshCw size={18} className="text-amber-400" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-sm font-bold uppercase tracking-wider text-emerald-300">Switch Learning Path?</DialogTitle>
              <DialogDescription className="text-[11px] text-emerald-500/40 leading-relaxed mt-2">
                Switching to{" "}
                <span className="font-bold text-emerald-300">{pendingLangSwitch === "Arabic" ? "Arabic" : "English"}</span>{" "}
                will purge accumulated progress and XP stats for this topic sector.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex flex-row gap-3 p-6 pt-4 bg-[#081210]/40 border-t border-emerald-500/10">
            <Button type="button" variant="ghost" onClick={() => { setIsSwitchLangConfirmOpen(false); setPendingLangSwitch(null); }} className="flex-1 h-9 rounded border border-emerald-500/20 bg-transparent text-emerald-500/60 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 font-mono">
              [ CANCEL ]
            </Button>
            <Button
              type="button"
              onClick={async () => {
                try {
                  const res = await apiClient.post<{ ok: boolean; xpRevoked: number }>(
                    `/api/roadmap/topics/${topicId}/reset-learning?language=${selectedLanguage}`
                  );
                  if ((res.xpRevoked ?? 0) > 0) toast({ title: "Path Switched", description: `Lost ${res.xpRevoked} XP from previous path.`, variant: "default" });
                } catch { /* ignore */ }
                if (pendingLangSwitch) { setSelectedLanguage(pendingLangSwitch); localStorage.setItem(`topic-lang-${topicId}`, pendingLangSwitch); }
                setIsSwitchLangConfirmOpen(false);
                setPendingLangSwitch(null);
                mutate(); mutateLevel(); mutateSummary();
              }}
              className="flex-1 h-9 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-400 font-mono"
            >
              [ SWITCH_PATH ]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

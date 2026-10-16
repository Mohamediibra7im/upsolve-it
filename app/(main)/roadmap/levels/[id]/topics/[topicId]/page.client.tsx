"use client";

import MemberPageState from "@/components/features/profile/MemberPageState";

import StudioProgress from "@/components/features/profile/StudioProgress";
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
    initial={false}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center py-12 gap-8 font-sans text-primary"
  >
    <div className="text-center space-y-3">
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
        <GraduationCap size={12} className="text-primary" />
        <span>Choose your learning path</span>
      </div>
      <h2 className="text-lg font-medium text-foreground font-heading text-xl tracking-tight">
        Choose how you learn
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Choose how you prefer to learn. Changing your path later resets this topic’s progress and XP.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
      <button
        onClick={() => onSelect("Arabic")}
        className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card hover:border-border transition-all duration-200 p-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="size-10 rounded-lg border border-border bg-card flex items-center justify-center text-primary shrink-0">
          <Video size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">Watch in Arabic</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Follow guided video lessons. Your watch progress is saved as you learn.
          </p>
        </div>
        <span className="text-xs font-medium text-primary group-hover:text-foreground transition-colors">
          Start this path
        </span>
      </button>

      <button
        onClick={() => onSelect("English")}
        className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card hover:border-border transition-all duration-200 p-5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="size-10 rounded-lg border border-border bg-card flex items-center justify-center text-primary shrink-0">
          <Globe size={18} />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">Read in English</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Explore articles and documentation, then mark each resource complete.
          </p>
        </div>
        <span className="text-xs font-medium text-primary group-hover:text-foreground transition-colors">
          Start this path
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

  if (error && !data) return <MemberPageState kind="error" title="We couldn’t open this topic" description="Your learning workspace is temporarily unavailable. Try again to continue."><Button variant="outline" onClick={() => mutate()}>Try again</Button><Button asChild variant="ghost"><Link href={`/roadmap/levels/${levelId}`}>Back to level</Link></Button></MemberPageState>;
  if (isLoading || !data) return <MemberPageState kind="loading" title="Opening your learning workspace" description="Gathering the resources and your progress." />;

  const problemsList = data.problems ?? [];

  const groupLinks = (() => {
    const raw = data.topic?.groupLinks;
    const str = Array.isArray(raw) ? raw.map((g: any) => g?.link ?? g?.toString() ?? "").filter(Boolean).join("\n") : typeof raw === "string" ? raw : "";
    return str.split("\n").map((l: string) => l.trim()).filter(Boolean);
  })();

  const resourceTypeIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video className="size-3 text-amber-400" />;
      case "Article": return <FileText className="size-3 text-primary" />;
      case "Documentation": return <FileText className="size-3 text-primary" />;
      case "Tutorial": return <Play className="size-3 text-violet-400" />;
      case "Course": return <BookOpen className="size-3 text-primary" />;
      case "PDF": return <FileText className="size-3 text-primary" />;
      case "Website": return <Globe className="size-3 text-teal-400" />;
      default: return <ExternalLink className="size-3 text-muted-foreground" />;
    }
  };


  return (
    <div className="min-h-screen pb-20 relative font-sans text-foreground">
      {/* Background */}

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-6">

        {/* ── TOP NAV ── */}
        <div className="flex items-center justify-end py-4 gap-4">
          {/* Step tabs */}
          {selectedLanguage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={currentStep === "learning"}
                onClick={() => setCurrentStep("learning")}
                className={cn(
                  "h-10 px-4 rounded-xl border font-medium text-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  currentStep === "learning"
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                Learn
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isProblemsUnlocked) setCurrentStep("problems");
                  else toast({ title: "Locked", description: `Reach ${data.topic.requiredLearningPct}% learning first.`, variant: "destructive" });
                }}
                className={cn(
                  "h-10 px-4 rounded-xl border font-medium text-sm transition-colors font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  currentStep === "problems"
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border",
                  !isProblemsUnlocked && "opacity-40 cursor-not-allowed"
                )}
              >
                Practice
              </button>
            </div>
          )}
        </div>

        {/* ── HERO ── */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Layers size={12} className="text-primary" />
            <span>Your learning workspace</span>
            <span className="flex-1 border-b border-border" />
            {selectedLanguage && (
              <span className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-lg border",
                selectedLanguage === "Arabic"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                  : "bg-primary/10 border-primary/20 text-primary"
              )}>
                {selectedLanguage} Path
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1 min-w-0">
              <h1 className="text-foreground leading-none font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                {data.topic.title}
              </h1>
              {data.topic.description && (
                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                  {data.topic.description}
                </p>
              )}
              {data.topic.subtopics && data.topic.subtopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {data.topic.subtopics.map((sub: string) => (
                    <span key={sub} className="text-xs font-medium text-muted-foreground">
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right: stats readouts */}
            <div className="flex flex-row lg:flex-col gap-4 shrink-0">
              {/* Reward readout */}
              <div className="py-2 px-3 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground block">XP reward</span>
                <span className="text-lg font-medium text-foreground tabular-nums">+{data.topic.topicXpReward} XP</span>
              </div>

              {/* Progress info */}
              {selectedLanguage && (
                <div className="py-2 px-3 border-b border-border">
                  <span className="text-xs font-medium text-muted-foreground block">Learning progress</span>
                  <span className="text-lg font-medium text-foreground tabular-nums">{Math.round(learningPct)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Block Meters */}
          {selectedLanguage && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Learning progress</span>
                  <span className="font-medium text-foreground">{Math.round(learningPct)}%</span>
                </div>
                <StudioProgress value={learningPct} label="Learning progress" className="w-24 sm:w-32" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Practice progress</span>
                  <span className="font-medium text-foreground">
                    {isProblemsUnlocked ? `${solvedCount}/${totalCount} solved` : "Locked"}
                  </span>
                </div>
                <StudioProgress value={problemPct} label="Practice progress" className="w-24 sm:w-32" />
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
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Path Switcher status bar */}
              <div className="flex items-center justify-between py-2.5 px-4 border border-border bg-card rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-muted-foreground">Your path ·</span>
                  <span className="font-medium text-foreground">{selectedLanguage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPendingLangSwitch(selectedLanguage === "Arabic" ? "English" : "Arabic"); setIsSwitchLangConfirmOpen(true); }}
                  className="h-7 px-3 rounded-lg border border-border bg-transparent text-muted-foreground font-medium text-xs hover:bg-primary/10 hover:text-foreground transition-all font-sans inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <RefreshCw size={9} />
                  Change path
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
                          <div className="rounded-lg border border-border bg-card overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                              <span className="text-xs font-medium text-primary truncate max-w-md">
                                {activeVideo.title}
                              </span>
                              {activeVideoProgress?.isCompleted && (
                                <span className="text-xs font-medium text-primary">Watched</span>
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
                            <div className="p-4 border-t border-border bg-card">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Video progress</span>
                                <span>{activeVideoProgress?.watchPct ?? 0}%</span>
                              </div>
                              <StudioProgress value={activeVideoProgress?.watchPct ?? 0} label="Video progress" className="w-24 sm:w-32" />
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 border border-border bg-card text-center text-muted-foreground text-xs">
                            This video is unavailable.
                          </div>
                        )}
                      </div>

                      {/* Playlist Sidebar */}
                      <div className="space-y-4">
                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                          <div className="px-4 py-2.5 border-b border-border bg-card">
                            <span className="text-xs font-medium text-primary block">Video lessons</span>
                            <span className="text-xs text-muted-foreground">{videoResources.length} video lessons</span>
                          </div>
                          <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
                            {videoResources.map((v, idx) => {
                              const vProg = data.progress?.resourceProgress?.[v._id];
                              const isActive = v._id === activeVideoId;
                              return (
                                <button
                                  key={v._id}
                                  type="button"
                                  onClick={() => setActiveVideoId(v._id)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-all text-xs font-sans",
                                    isActive ? "bg-primary/10 border-l-2 border-border text-foreground" : "hover:bg-card border-l-2 border-l-transparent text-muted-foreground"
                                  )}
                                >
                                  <span className="shrink-0 text-xs font-medium">
                                    {vProg?.isCompleted ? "✓" : String(idx + 1).padStart(2, "0")}
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
                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                            <span className="text-xs font-medium text-primary truncate max-w-md">
                              {activeVideo.title}
                            </span>
                            {activeVideoProgress?.isCompleted && (
                              <span className="text-xs font-medium text-primary">Watched</span>
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <VideoPlayer
                              youtubeUrl={activeVideo.url}
                              initialSeekSeconds={activeVideoProgress?.lastPositionSec ?? 0}
                              onProgress={(payload) => handleVideoProgress(activeVideo._id, payload)}
                            />
                          </div>
                          <div className="p-4 border-t border-border bg-card">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Video progress</span>
                              <span>{activeVideoProgress?.watchPct ?? 0}%</span>
                            </div>
                            <StudioProgress value={activeVideoProgress?.watchPct ?? 0} label="Video progress" className="w-24 sm:w-32" />
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 border border-border bg-card text-center text-muted-foreground text-xs">
                          This video is unavailable.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extra Materials Checklist */}
                  {arabicNonVideoResources.length > 0 && (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card">
                        <div>
                          <span className="text-xs font-medium text-primary block">Additional materials</span>
                          <span className="text-xs text-muted-foreground">{arabicNonVideoResources.length} resources</span>
                        </div>
                        <span className="text-xs text-primary">
                          {arabicNonVideoResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{arabicNonVideoResources.length} completed
                        </span>
                      </div>
                      <div className="divide-y divide-border">
                        {arabicNonVideoResources.map((res, idx) => {
                          const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                          const isToggling = togglingResourceIds.has(res._id);
                          return (
                            <div key={res._id} className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", rProg.isCompleted && "bg-primary/10")}>
                              <span className="hidden sm:block text-xs text-muted-foreground w-6 shrink-0 text-center">{String(idx + 1).padStart(2, "0")}</span>
                              <div className="hidden sm:flex shrink-0 size-8 rounded-lg border border-border bg-card items-center justify-center">
                                {resourceTypeIcon(res.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("font-medium transition-colors inline-flex items-center gap-1.5", rProg.isCompleted ? "text-muted-foreground line-through" : "text-foreground hover:text-foreground")}>
                                  {res.title}
                                  <ExternalLink size={9} className="opacity-40" />
                                </a>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                  <span>{res.type}</span>
                                  <span className="sm:hidden">+{res.xpReward} XP</span>
                                  {res.weight === 0 && <span className="text-muted-foreground border border-border px-1 rounded-lg">Optional</span>}
                                </div>
                              </div>
                              <span className="hidden sm:inline shrink-0 text-xs text-muted-foreground mr-2">
                                +{res.xpReward} XP
                              </span>
                              <button
                                type="button"
                                disabled={isToggling || !user}
                                aria-label={`${rProg.isCompleted ? "Mark incomplete" : "Mark complete"}: ${res.title}`}
                                aria-pressed={rProg.isCompleted}
                                onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                                className={cn("shrink-0 size-9 rounded-lg border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-primary border-border text-primary-foreground" : "border-border bg-card hover:border-border")}
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
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-card">
                    <div>
                      <span className="text-xs font-medium text-primary block">Reading materials</span>
                      <span className="text-xs text-muted-foreground">{englishResources.length} resources</span>
                    </div>
                    <span className="text-xs text-primary">
                      {englishResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{englishResources.length} completed
                    </span>
                  </div>

                  {englishResources.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs">
                      No reading materials have been added yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {englishResources.map((res, idx) => {
                        const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                        const isToggling = togglingResourceIds.has(res._id);
                        return (
                          <div key={res._id} className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", rProg.isCompleted && "bg-primary/10")}>
                            <span className="hidden sm:block text-xs text-muted-foreground w-6 shrink-0 text-center">{String(idx + 1).padStart(2, "0")}</span>
                            <div className="hidden sm:flex shrink-0 size-8 rounded-lg border border-border bg-card items-center justify-center">
                              {resourceTypeIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("font-medium transition-colors inline-flex items-center gap-1.5", rProg.isCompleted ? "text-muted-foreground line-through" : "text-foreground hover:text-foreground")}>
                                {res.title}
                                <ExternalLink size={9} className="opacity-40" />
                              </a>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                                <span>{res.type}</span>
                                  <span className="sm:hidden">+{res.xpReward} XP</span>
                                {res.weight === 0 && <span className="text-muted-foreground border border-border px-1 rounded-lg">Optional</span>}
                              </div>
                            </div>
                            <span className="hidden sm:inline shrink-0 text-xs text-muted-foreground mr-2">
                              +{res.xpReward} XP
                            </span>
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              aria-label={`${rProg.isCompleted ? "Mark incomplete" : "Mark complete"}: ${res.title}`}
                                aria-pressed={rProg.isCompleted}
                                onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                              className={cn("shrink-0 size-9 rounded-lg border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-primary border-border text-primary-foreground" : "border-border bg-card hover:border-border")}
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border border-border bg-card rounded-lg">
                <span className="text-xs text-muted-foreground">
                  {isProblemsUnlocked
                    ? "Ready to put it into practice"
                    : `Complete ${data.topic.requiredLearningPct}% of learning to unlock practice`
                  }
                </span>

                <div className="flex items-center gap-3">
                  {isProblemsUnlocked && learningPct < 100 && selectedLanguage === "Arabic" && (
                    <Button
                      type="button"
                      onClick={handleCompleteLearning}
                      disabled={isCompletingLearning}
                      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary font-sans inline-flex items-center"
                    >
                      {isCompletingLearning ? (
                        <Loader2 size={10} className="animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 size={10} className="mr-1" />
                      )}
                      Complete
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => { if (isProblemsUnlocked) setCurrentStep("problems"); }}
                    disabled={!isProblemsUnlocked}
                    className={cn(
                      "h-9 px-4 rounded-lg font-medium text-xs transition-all font-sans",
                      isProblemsUnlocked
                        ? "bg-primary text-primary-foreground border-border hover:bg-primary"
                        : "bg-transparent border-border text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    {isProblemsUnlocked ? "Open practice" : "Locked"}
                  </Button>
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── PRACTICE STEP (PROBLEMS MATRIX) ── */
            <motion.div
              key="practice"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {!isProblemsUnlocked ? (
                <div className="py-12 border border-border bg-card text-center space-y-4">
                  <div className="size-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground mx-auto">
                    <Lock size={16} />
                  </div>
                  <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">A little learning comes first.</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Complete at least {data.topic.requiredLearningPct}% of the learning resources to unlock practice. (Current: {Math.round(learningPct)}%)
                  </p>
                  <Button type="button" onClick={() => setCurrentStep("learning")} className="h-9 px-4 rounded-lg border border-border bg-transparent text-primary font-medium text-xs hover:bg-primary/10 font-sans">
                    Go to learning
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
                    <div>
                      <span className="text-xs font-medium text-primary block">Practice problems</span>
                      <span className="text-xs text-muted-foreground">
                        Resolve {data.topic.requiredProblemPct}% of targets
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Solved</span>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {solvedCount}/{totalCount}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-4 py-2.5 border-b border-border bg-card">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion</span>
                      <span className={problemPct >= (data.topic.requiredProblemPct ?? 60) ? "text-primary" : "text-foreground"}>
                        {Math.round(problemPct)}%
                      </span>
                    </div>
                    <StudioProgress value={problemPct} label="Practice progress" className="w-24 sm:w-32" />
                  </div>

                  {/* Codeforces Group links */}
                  {groupLinks.length > 0 && (
                    <div className="px-4 py-3 border-b border-border bg-card text-xs">
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-muted-foreground block">Codeforces group resources</span>
                        {groupLinks.map((link: string, i: number) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                            {link} <ExternalLink size={9} className="opacity-40" />
                          </a>
                        ))}
                        {data.topic?.groupNote && <p className="text-xs text-muted-foreground italic mt-1">{data.topic.groupNote}</p>}
                      </div>
                    </div>
                  )}

                  {/* Problems checklist */}
                  {problemsList.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground text-xs">
                      No practice problems have been added yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {problemsList.map((prob, index) => {
                        const isSolved = Boolean(data.progress?.problemProgress?.[prob._id]);
                        const isToggling = togglingProblemIds.has(prob._id);
                        return (
                          <div
                            key={prob._id}
                            className={cn("flex items-center gap-4 px-4 py-3.5 transition-all text-xs", isSolved && "bg-primary/10")}
                          >
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              aria-label={`${isSolved ? "Mark unsolved" : "Mark solved"}: ${prob.name}`}
                              aria-pressed={isSolved}
                              onClick={() => handleToggleProblem(prob._id, isSolved)}
                              className={cn("shrink-0 size-9 rounded-lg border flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isToggling && "opacity-50 cursor-wait animate-pulse", isSolved ? "bg-primary border-border text-primary-foreground" : "border-border bg-card hover:border-border")}
                            >
                              {isSolved && <Check size={12} />}
                            </button>

                            <span className="hidden sm:block text-xs text-muted-foreground w-6 shrink-0 text-center">{String(prob.orderIndex ?? index + 1).padStart(2, "0")}</span>

                            <div className="flex-1 min-w-0">
                              <a
                                href={prob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn("font-medium transition-colors inline-flex items-center gap-1.5", isSolved ? "text-muted-foreground line-through" : "text-foreground hover:text-foreground")}
                              >
                                {prob.name}
                                <ExternalLink size={9} className="opacity-40" />
                              </a>
                            </div>

                            <span className={cn("shrink-0 text-xs font-medium px-2 py-0.5 rounded-lg border mr-2", isSolved ? "border-border text-muted-foreground" : "border-primary/20 text-primary")}>
                              +{prob.xpReward} XP
                            </span>

                            <span className={cn("shrink-0 hidden sm:inline text-xs font-medium", isSolved ? "text-primary" : "text-muted-foreground")}>
                              {isSolved ? "Solved" : "Pending"}
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
                      <div className="flex justify-end px-4 py-3 border-t border-border bg-card">
                        {canProceed ? (
                          <Link
                            href={`/roadmap/levels/${levelId}/topics/${next._id}`}
                            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            Next topic:  {next.title}
                          </Link>
                        ) : (
                          <span
                            className="h-9 px-4 rounded-lg border border-border text-muted-foreground text-xs font-medium inline-flex items-center cursor-not-allowed"
                            title={`Need ${reqLearning}% learning and ${reqProblem}% problem progress`}
                          >
                            Locked · learning  {Math.round(learningPct)}/{reqLearning}% · practice {Math.round(problemPct)}/{reqProblem}%
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
        <DialogContent className="max-w-sm bg-card border border-border rounded-lg p-0 overflow-hidden font-sans text-primary">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center size-10 rounded-lg border border-amber-500/25 bg-amber-950/10 mx-auto mb-4">
              <RefreshCw size={18} className="text-amber-400" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-sm font-medium text-foreground">Switch Learning Path?</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
                Switching to{" "}
                <span className="font-medium text-foreground">{pendingLangSwitch === "Arabic" ? "Arabic" : "English"}</span>{" "}
                will reset your progress and XP for this topic.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex flex-row gap-3 p-6 pt-4 bg-card border-t border-border">
            <Button type="button" variant="ghost" onClick={() => { setIsSwitchLangConfirmOpen(false); setPendingLangSwitch(null); }} className="flex-1 h-9 rounded-lg border border-border bg-transparent text-muted-foreground font-medium text-xs hover:bg-primary/10 font-sans">
              Cancel
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
              className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary font-sans"
            >
              Change path
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

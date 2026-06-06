"use client";

import Link from "next/link";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useParams} from "next/navigation";
import {m as motion, AnimatePresence} from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Target,
  Video,
  ExternalLink,
  ChevronRight,
  Check,
  Globe,
  Play,
  FileText,
  BookOpen,
  RefreshCw,
  Zap,
  Award,
  LayoutList,
  GraduationCap,
  Layers,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import { useRoadmapTopic, useRoadmapLevel, useRoadmapUserSummary } from "@/hooks/roadmap/useRoadmap";
import { VideoPlayer, progressWidthClass } from "@/components/features/roadmap";
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
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.35 }}
    className="flex flex-col items-center justify-center py-16 gap-10"
  >
    <div className="text-center space-y-3">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">
        <GraduationCap size={12} /> Choose Your Path
      </div>
      <h2 className="text-3xl font-[1000] uppercase tracking-tight text-foreground leading-none">
        How do you want to learn?
      </h2>
      <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto leading-relaxed">
        Pick a language. You can switch later, but your progress will reset.
      </p>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 w-full max-w-2xl">
      <motion.button
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect("Arabic")}
        className="group relative flex flex-col gap-5 rounded-3xl border border-border/60 dark:border-border/40 bg-card/50 hover:bg-card/80 hover:border-amber-500/40 transition-all duration-300 p-7 text-left shadow-md overflow-hidden cursor-pointer"
      >
        <div className="absolute -top-10 -right-10 size-32 rounded-full bg-amber-500/8 blur-3xl group-hover:bg-amber-500/15 transition-colors duration-500" />
        <div className="relative z-10 size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Video className="size-6 text-amber-400" />
        </div>
        <div className="relative z-10 space-y-1.5">
          <h3 className="text-base font-black text-foreground">Arabic Path</h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Video lectures in Arabic with automatic watch-progress tracking.
          </p>
        </div>
        <span className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400 group-hover:gap-2.5 transition-all duration-200">
          Start <ChevronRight size={12} />
        </span>
      </motion.button>

      <motion.button
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect("English")}
        className="group relative flex flex-col gap-5 rounded-3xl border border-border/60 dark:border-border/40 bg-card/50 hover:bg-card/80 hover:border-sky-500/40 transition-all duration-300 p-7 text-left shadow-md overflow-hidden cursor-pointer"
      >
        <div className="absolute -top-10 -right-10 size-32 rounded-full bg-sky-500/8 blur-3xl group-hover:bg-sky-500/15 transition-colors duration-500" />
        <div className="relative z-10 size-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Globe className="size-6 text-sky-400" />
        </div>
        <div className="relative z-10 space-y-1.5">
          <h3 className="text-base font-black text-foreground">English Path</h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Articles, docs, and reading checklists with manual checkoff.
          </p>
        </div>
        <span className="relative z-10 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400 group-hover:gap-2.5 transition-all duration-200">
          Start <ChevronRight size={12} />
        </span>
      </motion.button>
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

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm font-bold text-destructive uppercase tracking-wider">Failed to load topic</p>
          <p className="text-xs text-muted-foreground">{error}</p>
          <button type="button" onClick={() => mutate()} className="text-xs text-primary hover:underline">Try again</button>
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
      case "Video": return <Video className="size-3.5 text-amber-400" />;
      case "Article": return <FileText className="size-3.5 text-sky-400" />;
      case "Documentation": return <FileText className="size-3.5 text-blue-400" />;
      case "Tutorial": return <Play className="size-3.5 text-violet-400" />;
      case "Course": return <BookOpen className="size-3.5 text-emerald-400" />;
      case "PDF": return <FileText className="size-3.5 text-orange-400" />;
      case "Website": return <Globe className="size-3.5 text-teal-400" />;
      default: return <ExternalLink className="size-3.5 text-muted-foreground/40" />;
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(var(--primary),0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 size-[600px] rounded-full bg-primary/4 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 size-[500px] rounded-full bg-emerald-500/3 blur-[140px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* ── TOP NAV ── */}
        <div className="flex items-center justify-between py-6 gap-4">
          <Link
            href={`/roadmap/levels/${levelId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 hover:bg-primary/5 hover:border-primary/30 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft size={13} /> Back to Level
          </Link>

          {/* Step tabs */}
          {selectedLanguage && (
            <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-sm p-1">
              <button
                type="button"
                onClick={() => setCurrentStep("learning")}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                  currentStep === "learning"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BookOpen size={12} /> Learn
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isProblemsUnlocked) setCurrentStep("problems");
                  else toast({ title: "Locked", description: `Reach ${data.topic.requiredLearningPct}% learning first.`, variant: "destructive" });
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200",
                  currentStep === "problems"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  !isProblemsUnlocked && "opacity-40 cursor-not-allowed"
                )}
              >
                {isProblemsUnlocked ? <Target size={12} /> : <Lock size={12} />} Practice
              </button>
            </div>
          )}
        </div>

        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-[2rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden mb-8 shadow-xl"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 size-72 rounded-full bg-primary/8 blur-[90px]" />
            <div className="absolute bottom-0 left-0 size-48 rounded-full bg-emerald-500/5 blur-[70px]" />
          </div>

          <div className="relative z-10 p-7 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
              {/* Left: topic info */}
              <div className="space-y-4 flex-1 min-w-0">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                    <Layers size={10} /> Topic
                  </span>
                  {selectedLanguage && (
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border",
                      selectedLanguage === "Arabic"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                    )}>
                      {selectedLanguage === "Arabic" ? <Video size={9} /> : <Globe size={9} />}
                      {selectedLanguage} Path
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl xl:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none">
                  {data.topic.title}
                </h1>

                {data.topic.description && (
                  <p className="text-sm text-muted-foreground/75 max-w-2xl leading-relaxed">
                    {data.topic.description}
                  </p>
                )}

                {data.topic.subtopics && data.topic.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {data.topic.subtopics.map((sub: string) => (
                      <span key={sub} className="rounded-full bg-background/70 border border-border/50 px-2.5 py-1 text-[9px] font-bold text-muted-foreground/70">
                        {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: stat cards */}
              <div className="flex flex-row lg:flex-col gap-3 shrink-0">
                {/* XP reward */}
                <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-3.5">
                  <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Zap size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-primary/60">Topic Reward</p>
                    <p className="text-xl font-[1000] text-primary leading-none mt-0.5">+{data.topic.topicXpReward} XP</p>
                  </div>
                </div>

                {/* Learning progress pill */}
                {selectedLanguage && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background/50 px-5 py-3.5">
                    <div className="size-9 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                      <Award size={16} className="text-muted-foreground/60" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">Learning</p>
                      <p className="text-xl font-[1000] text-foreground leading-none mt-0.5">{Math.round(learningPct)}%</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bars — only when language is selected */}
            {selectedLanguage && (
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {/* Learning bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                    <span className="flex items-center gap-1"><BookOpen size={10} /> Learn</span>
                    <span className={cn(learningPct >= (data.topic.requiredLearningPct ?? 80) ? "text-emerald-400" : "text-primary")}>
                      {Math.round(learningPct)}% / {data.topic.requiredLearningPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background border border-border/40 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${learningPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full rounded-full", learningPct >= (data.topic.requiredLearningPct ?? 80) ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-primary to-blue-400")}
                    />
                  </div>
                </div>
                {/* Practice bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">
                    <span className="flex items-center gap-1"><Target size={10} /> Practice</span>
                    <span className={cn(isProblemsUnlocked ? (problemPct >= (data.topic.requiredProblemPct ?? 60) ? "text-emerald-400" : "text-foreground") : "text-muted-foreground/30")}>
                      {isProblemsUnlocked ? `${solvedCount}/${totalCount} solved` : "Locked"}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background border border-border/40 overflow-hidden">
                    {isProblemsUnlocked ? (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${problemPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    ) : (
                      <div className="h-full rounded-full bg-muted/50 w-full" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <AnimatePresence mode="wait">
          {/* ── LANGUAGE CHOICE ── */}
          {selectedLanguage === null ? (
            <LanguageChoice key="langChoice" onSelect={handleSelectLanguage} />

          ) : currentStep === "learning" ? (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {/* Path switcher bar */}
              <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/50">Active path:</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    selectedLanguage === "Arabic" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                  )}>
                    {selectedLanguage === "Arabic" ? <Video size={9} /> : <Globe size={9} />}
                    {selectedLanguage}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { setPendingLangSwitch(selectedLanguage === "Arabic" ? "English" : "Arabic"); setIsSwitchLangConfirmOpen(true); }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 hover:border-primary/30 bg-background hover:bg-primary/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200"
                >
                  <RefreshCw size={10} /> Switch
                </button>
              </div>

              {/* ── ARABIC LEARNING ── */}
              {selectedLanguage === "Arabic" && (
                <div className="grid lg:grid-cols-3 gap-5">
                  {/* Video player — takes 2 cols */}
                  <div className="lg:col-span-2 space-y-4">
                    {activeVideo ? (
                      <div className="rounded-[1.75rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-lg">
                        {/* Player header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-background/30">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)] shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 truncate">
                              {activeVideo.title}
                            </span>
                          </div>
                          {activeVideoProgress?.isCompleted && (
                            <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={10} /> Watched
                            </span>
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
                        <div className="px-5 py-3 border-t border-border/40 bg-background/20">
                          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/40 mb-1.5">
                            <span>Watch Progress</span>
                            <span>{activeVideoProgress?.watchPct ?? 0}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div className={cn("h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300", progressWidthClass(activeVideoProgress?.watchPct ?? 0))} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[1.75rem] border border-border/60 bg-card/50 backdrop-blur-xl p-12 text-center">
                        <Video className="size-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm font-bold text-muted-foreground/50">No video available for this topic.</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar — video playlist + extra resources */}
                  <div className="space-y-4">
                    {/* Video playlist */}
                    {videoResources.length > 1 && (
                      <div className="rounded-[1.75rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-md">
                        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40 bg-amber-500/5">
                          <div className="size-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <LayoutList size={12} className="text-amber-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Playlist</p>
                            <p className="text-[9px] text-muted-foreground/50">{videoResources.length} lectures</p>
                          </div>
                        </div>
                        <div className="divide-y divide-border/30 max-h-64 overflow-y-auto">
                          {videoResources.map((v, idx) => {
                            const vProg = data.progress?.resourceProgress?.[v._id];
                            const isActive = v._id === activeVideoId;
                            return (
                              <button
                                key={v._id}
                                type="button"
                                onClick={() => setActiveVideoId(v._id)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150",
                                  isActive ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-background/60 border-l-2 border-l-transparent"
                                )}
                              >
                                <span className={cn(
                                  "shrink-0 size-6 rounded-full flex items-center justify-center text-[9px] font-black",
                                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                  {vProg?.isCompleted ? <Check size={10} strokeWidth={3} /> : idx + 1}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-bold line-clamp-2 leading-tight flex-1",
                                  isActive ? "text-primary" : "text-muted-foreground/80"
                                )}>
                                  {v.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Non-video Arabic resources */}
                    {arabicNonVideoResources.length > 0 && (
                      <div className="rounded-[1.75rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-md">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-amber-500/5">
                          <div className="flex items-center gap-2.5">
                            <div className="size-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                              <FileText size={12} className="text-amber-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Extra Materials</p>
                              <p className="text-[9px] text-muted-foreground/50">
                                {arabicNonVideoResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{arabicNonVideoResources.length} done
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-border/30">
                          {arabicNonVideoResources.map((res, idx) => {
                            const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                            const isToggling = togglingResourceIds.has(res._id);
                            return (
                              <div key={res._id} className={cn("flex items-center gap-3 px-4 py-3 transition-all duration-150", rProg.isCompleted ? "bg-emerald-500/[0.04]" : "hover:bg-background/60")}>
                                <span className="text-[9px] font-mono text-muted-foreground/25 w-4 shrink-0 text-center">{idx + 1}</span>
                                <button
                                  type="button"
                                  disabled={isToggling || !user}
                                  onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                                  aria-label={`Mark ${res.title} as ${rProg.isCompleted ? "incomplete" : "complete"}`}
                                  className={cn("shrink-0 size-5 rounded-md border flex items-center justify-center transition-all", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 bg-background hover:border-amber-400/50")}
                                >
                                  {rProg.isCompleted && <Check size={10} strokeWidth={3} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("text-[10px] font-bold line-clamp-1 flex items-center gap-1 group transition-colors", rProg.isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground hover:text-amber-400")}>
                                    {res.title}
                                    <ExternalLink size={9} className="shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                                  </a>
                                  <p className="text-[8px] text-muted-foreground/40 mt-0.5">{res.type}{res.weight === 0 ? " · Optional" : ""}</p>
                                  {res.description && (
                                    <p className="text-[10px] text-muted-foreground/55 mt-1 leading-relaxed line-clamp-2">{res.description}</p>
                                  )}
                                </div>
                                <span className={cn("shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded-full border", rProg.isCompleted ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20")}>
                                  +{res.xpReward}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── ENGLISH LEARNING ── */}
              {selectedLanguage === "English" && (
                <div className="rounded-[1.75rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-sky-500/5">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <BookOpen size={15} className="text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-sky-400">Reading List</h3>
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5">{englishResources.length} resource{englishResources.length !== 1 ? "s" : ""} · check off each one as you go</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
                      {englishResources.filter(r => data.progress?.resourceProgress?.[r._id]?.isCompleted).length}/{englishResources.length} done
                    </span>
                  </div>

                  {englishResources.length === 0 ? (
                    <div className="flex flex-col items-center py-14 gap-3">
                      <div className="size-14 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center">
                        <BookOpen size={22} className="text-muted-foreground/20" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider">No resources yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {englishResources.map((res, idx) => {
                        const rProg = data.progress?.resourceProgress?.[res._id] || { watchPct: 0, isCompleted: false };
                        const isToggling = togglingResourceIds.has(res._id);
                        return (
                          <div key={res._id} className={cn("group flex items-center gap-4 px-6 py-4 transition-all duration-150", rProg.isCompleted ? "bg-emerald-500/[0.04]" : "hover:bg-background/50")}>
                            <span className="text-[10px] font-mono text-muted-foreground/25 w-5 shrink-0 text-center">{idx + 1}</span>
                            <div className="shrink-0 size-8 rounded-xl bg-background border border-border/40 flex items-center justify-center group-hover:border-sky-500/20 transition-colors">
                              {resourceTypeIcon(res.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("text-xs font-bold transition-colors line-clamp-1 flex items-center gap-1.5 group/link", rProg.isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground hover:text-sky-400")}>
                                {res.title}
                                <ExternalLink size={9} className="shrink-0 opacity-0 group-hover/link:opacity-50 transition-opacity" />
                              </a>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-muted-foreground/40">{res.type}</span>
                                {res.weight === 0 && <span className="text-[8px] font-black text-muted-foreground/30 bg-muted/40 border border-border/30 px-1.5 py-0.5 rounded uppercase">Optional</span>}
                              </div>
                              {res.description && (
                                <p className="text-[10px] text-muted-foreground/55 mt-1 leading-relaxed line-clamp-2">{res.description}</p>
                              )}
                            </div>
                            <span className={cn("shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border", rProg.isCompleted ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-sky-400 bg-sky-500/10 border-sky-500/20")}>
                              +{res.xpReward} XP
                            </span>
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              onClick={() => handleToggleResource(res._id, rProg.isCompleted)}
                              aria-label={`Mark ${res.title} as ${rProg.isCompleted ? "incomplete" : "complete"}`}
                              className={cn("shrink-0 size-5 rounded-md border flex items-center justify-center transition-all", isToggling && "opacity-50 cursor-wait animate-pulse", rProg.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/25 bg-background hover:border-sky-400/50")}
                            >
                              {rProg.isCompleted && <Check size={11} strokeWidth={3} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Unlock CTA */}
              <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/40 px-6 py-4">
                <div className="text-xs text-muted-foreground/60">
                  {isProblemsUnlocked
                    ? <span className="flex items-center gap-1.5 text-emerald-400 font-black"><CheckCircle2 size={14} /> Practice problems unlocked!</span>
                    : <span>Reach <span className="font-black text-primary">{data.topic.requiredLearningPct}%</span> to unlock practice problems</span>
                  }
                </div>
                <Button
                  type="button"
                  onClick={() => { if (isProblemsUnlocked) setCurrentStep("problems"); }}
                  disabled={!isProblemsUnlocked}
                  className={cn(
                    "h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    isProblemsUnlocked
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:shadow-primary/30"
                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  {isProblemsUnlocked ? "Open Practice" : "Locked"}
                  {isProblemsUnlocked ? <ChevronRight size={13} className="ml-1" /> : <Lock size={12} className="ml-1" />}
                </Button>
              </div>
            </motion.div>

          ) : (
            /* ── PRACTICE STEP ── */
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              {!isProblemsUnlocked ? (
                <div className="rounded-[1.75rem] border border-border/60 bg-card/50 backdrop-blur-xl p-14 text-center space-y-4">
                  <div className="size-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mx-auto">
                    <Lock size={24} className="text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider">Practice Locked</h3>
                  <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
                    Complete <span className="font-black text-primary">{data.topic.requiredLearningPct}%</span> of the learning materials first. Currently at <span className="font-black text-foreground">{Math.round(learningPct)}%</span>.
                  </p>
                  <Button type="button" onClick={() => setCurrentStep("learning")} variant="outline" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-wider">
                    <ArrowLeft size={12} className="mr-1.5" /> Go to Learning
                  </Button>
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-border/60 dark:border-border/40 bg-card/50 dark:bg-card/20 backdrop-blur-xl overflow-hidden shadow-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-emerald-500/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Target size={15} className="text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-400">Practice Problems</h3>
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                          Solve {data.topic.requiredProblemPct}% to complete this topic
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/40">Progress</p>
                      <p className="text-sm font-[1000] text-foreground">{solvedCount}<span className="text-muted-foreground/40 font-bold">/{totalCount}</span></p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="px-6 py-3 border-b border-border/40 bg-background/20">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-muted-foreground/40 mb-1.5">
                      <span>Completion</span>
                      <span className={problemPct >= (data.topic.requiredProblemPct ?? 60) ? "text-emerald-400" : "text-foreground"}>{Math.round(problemPct)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${problemPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      />
                    </div>
                  </div>

                  {/* CF group links */}
                  {groupLinks.length > 0 && (
                    <div className="px-6 py-4 border-b border-border/40 bg-background/10">
                      <div className="flex items-start gap-3">
                        <div className="size-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <ExternalLink size={12} className="text-emerald-400" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Codeforces Group</p>
                          {groupLinks.map((link: string, i: number) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-emerald-400 transition-colors truncate">
                              {link} <ExternalLink size={9} className="shrink-0 opacity-60" />
                            </a>
                          ))}
                          {data.topic?.groupNote && <p className="text-[10px] text-muted-foreground/50 italic">{data.topic.groupNote}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Problems list */}
                  {problemsList.length === 0 ? (
                    <div className="flex flex-col items-center py-14 gap-3">
                      <div className="size-14 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center">
                        <Target size={22} className="text-muted-foreground/20" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-wider">No problems yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/30">
                      {problemsList.map((prob, index) => {
                        const isSolved = Boolean(data.progress?.problemProgress?.[prob._id]);
                        const isToggling = togglingProblemIds.has(prob._id);
                        return (
                          <div
                            key={prob._id}
                            className={cn(
                              "group flex items-center gap-4 px-6 py-4 transition-all duration-150",
                              isSolved ? "bg-emerald-500/[0.04]" : "hover:bg-background/50"
                            )}
                          >
                            {/* Checkbox */}
                            <button
                              type="button"
                              disabled={isToggling || !user}
                              onClick={() => handleToggleProblem(prob._id, isSolved)}
                              aria-label={`Mark ${prob.name} as ${isSolved ? "unsolved" : "solved"}`}
                              className={cn(
                                "shrink-0 size-5 rounded-md border flex items-center justify-center transition-all",
                                isToggling && "opacity-50 cursor-wait animate-pulse",
                                isSolved ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "border-muted-foreground/25 bg-background hover:border-emerald-400/50"
                              )}
                            >
                              {isSolved && <Check size={11} strokeWidth={3} />}
                            </button>

                            {/* Index */}
                            <span className="text-[10px] font-mono text-muted-foreground/25 w-5 shrink-0 text-center">{prob.orderIndex ?? index + 1}</span>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <a
                                href={prob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn("text-xs font-bold transition-colors line-clamp-1 flex items-center gap-1.5 group/link", isSolved ? "text-muted-foreground/50 line-through" : "text-foreground hover:text-primary")}
                              >
                                {prob.name}
                                <ExternalLink size={9} className="shrink-0 opacity-0 group-hover/link:opacity-50 transition-opacity" />
                              </a>
                            </div>

                            {/* XP */}
                            <span className={cn("shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full border", isSolved ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-primary bg-primary/10 border-primary/20")}>
                              +{prob.xpReward} XP
                            </span>

                            {/* Status */}
                            <span className={cn("shrink-0 hidden sm:inline-flex items-center text-[9px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider", isSolved ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground/40 bg-muted/40 border-border/40")}>
                              {isSolved ? "Solved" : "Open"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Next topic */}
                  {levelData?.topics && (() => {
                    const idx = levelData.topics.findIndex((t) => t._id === topicId);
                    const next = idx !== -1 ? levelData.topics[idx + 1] : null;
                    if (!next) return null;
                    return (
                      <div className="flex justify-end px-6 py-4 border-t border-border/40 bg-background/10">
                        <Link
                          href={`/roadmap/levels/${levelId}/topics/${next._id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-primary transition-all duration-200"
                        >
                          Next: {next.title} <ChevronRight size={12} />
                        </Link>
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
        <DialogContent className="max-w-sm bg-card border-border/60 rounded-3xl p-0 overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto mb-4">
              <RefreshCw size={20} className="text-amber-400" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-base font-black uppercase tracking-wider">Switch Learning Path?</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground/70 leading-relaxed mt-2">
                Switching to{" "}
                <span className="font-bold text-foreground">{pendingLangSwitch === "Arabic" ? "Arabic" : "English"}</span>{" "}
                will reset your current progress and XP for this topic.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter className="flex flex-row gap-3 p-6 pt-4 bg-muted/30 border-t border-border/40">
            <Button type="button" variant="ghost" onClick={() => { setIsSwitchLangConfirmOpen(false); setPendingLangSwitch(null); }} className="flex-1 rounded-xl font-bold text-xs h-10 border border-border/60 hover:bg-background/80">
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
              className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10 hover:bg-primary/90"
            >
              Switch Path
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

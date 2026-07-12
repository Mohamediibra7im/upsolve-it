"use client";

import { useTraining, useTags } from "@/hooks/training";
import { Trainer, TagSelector, LevelSelector, ModeSelector } from "@/components/features/training";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { Flame, Terminal, Cpu, Settings, Tag } from "lucide-react";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import type { TrainingMode } from "@/types/TrainingMode";
import {
  buildRatingsForMode,
  customRatingsFromProblems,
} from "@/services/training/modeRatings";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";

type WeaknessApi = {
  hasEnoughData: boolean;
  weakTags: { tag: string; score: number }[];
};

export default function TrainingPage() {
  const { user } = useUser();
  const { allTags, selectedTags, onTagClick, onClearTags } = useTags();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<TrainingMode>("ladder");
  const [weaknessFallback, setWeaknessFallback] = useState(false);

  const {
    startTraining,
    stopTraining,
    problems,
    training,
    isTraining,
    isLoading,
    isInitializing,
    isRefreshing,
    refreshProblemStatus,
    finishTraining,
    generateProblems,
    generateProblemsFromRatings,
    submissionStatuses,
    notifyProblemOpened,
    extendEndTime,
  } = useTraining();

  const [customRatings, setCustomRatings] = useState<{
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }>(() => {
    if (globalThis.window !== undefined) {
      const stored = localStorage.getItem("training-tracker-customRatings");
      if (stored) return JSON.parse(stored);
    }
    return { P1: 800, P2: 800, P3: 800, P4: 800 };
  });

  useEffect(() => {
    localStorage.setItem(
      "training-tracker-customRatings",
      JSON.stringify(customRatings),
    );
  }, [customRatings]);

  const [showRatings, setShowRatings] = useState(false);

  const { data: weakness } = useSWR<WeaknessApi>(
    user ? "/api/users/me/weaknesses" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const handleLevelChange = useCallback((ratings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => {
    setCustomRatings(ratings);
  }, []);

  const handleGenerateProblems = useCallback(() => {
    if (!user) return;
    const u = user.rating || 1500;

    const reportGenerate = (result: {
      ok: boolean;
      reason?: "pool-not-ready" | "empty-result";
    }) => {
      if (result.ok) return;
      if (result.reason === "pool-not-ready") {
        toast({
          title: "Still loading problem data",
          description:
            "Codeforces lists are loading in the background. Wait a few seconds and tap Generate again.",
        });
      } else {
        toast({
          title: "No problems matched",
          description:
            "Try different tags, adjust level, or pick another mode. Some filters leave no problems at those ratings.",
        });
      }
    };

    if (selectedMode === "weakness") {
      if (!weakness?.hasEnoughData || !weakness.weakTags?.length) {
        toast({
          title: "Weakness mode",
          description:
            "Not enough data yet. Complete more sessions first. Using ladder pools.",
        });
        const r = generateProblems(selectedTags, null, null, customRatings);
        setWeaknessFallback(true);
        reportGenerate(r);
        return;
      }
      const weakVals = new Set(weakness.weakTags.map((w) => w.tag));
      const tagObjs = allTags.filter((t) => weakVals.has(t.value));
      const base = buildRatingsForMode("weakness", u, customRatings);
      const r = generateProblemsFromRatings(
        base.ratings,
        tagObjs.length ? tagObjs : selectedTags,
        null,
        null,
      );
      setWeaknessFallback(false);
      reportGenerate(r);
      return;
    }

    setWeaknessFallback(false);
    const base = buildRatingsForMode(selectedMode, u, customRatings);
    const r = generateProblemsFromRatings(
      base.ratings,
      selectedTags,
      null,
      null,
    );
    reportGenerate(r);
  }, [
    user,
    selectedMode,
    weakness,
    allTags,
    selectedTags,
    customRatings,
    generateProblems,
    generateProblemsFromRatings,
    toast,
  ]);

  const handleStartSession = useCallback(async () => {
    if (!user || !problems?.length) return;
    const u = user.rating || 1500;
    const base = buildRatingsForMode(selectedMode, u, customRatings);
    const cr = customRatingsFromProblems(problems);

    await startTraining({
      customRatings: cr,
      trainingMode: selectedMode,
      durationMinutes: base.durationMinutes,
      showRatings: base.showRatings && showRatings,
      weaknessFallback:
        selectedMode === "weakness" ? weaknessFallback : false,
      tags: selectedTags.map((t) => t.value),
    });
  }, [
    user,
    problems,
    selectedMode,
    customRatings,
    showRatings,
    weaknessFallback,
    selectedTags,
    startTraining,
  ]);

  const effectiveShowRatings =
    selectedMode === "contest" ? false : showRatings;

  const hideContestDetails = training?.trainingMode === "contest";

  if (isInitializing || !user) return <Loader />;

  if (isTraining) {
    const modeLabel =
      training?.trainingMode === "contest"
        ? "Contest Simulation"
        : training?.trainingMode === "speed"
          ? "Speed Round"
          : training?.trainingMode === "endurance"
            ? "Endurance Mode"
            : training?.trainingMode === "weakness"
              ? "Weakness Training"
              : "Ladder Training";

    return (
      <section className="min-h-screen pb-20 pt-0 font-mono text-emerald-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
          {/* Unified Terminal Cockpit Frame */}
          <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-[#040706] shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
            
            {/* Cockpit Shell Top Status Header */}
            <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
              <div className="flex items-center gap-2">
                <Terminal size={12} className="text-emerald-400 animate-pulse" />
                <span>TERMINAL WORKSTATION // PORT_3000</span>
              </div>
              <div className="flex items-center gap-6">
                <span>MODE: {modeLabel.toUpperCase()}</span>
                <span>CF HANDLE: {user.codeforcesHandle}</span>
                <span className="inline-flex items-center gap-1">
                  <Cpu size={10} className="animate-spin duration-3000 text-emerald-400" /> STATUS_LIVE
                </span>
              </div>
            </div>

            {/* Active Viewport Screen Content */}
            <div className="p-6 relative z-10 min-h-[420px] bg-[#040706]/95">
              <Trainer
                status={isRefreshing ? "refreshing" : isTraining ? "training" : "idle"}
                training={training}
                problems={problems}
                onGenerateProblems={handleGenerateProblems}
                onStartSession={handleStartSession}
                stopTraining={stopTraining}
                refreshProblemStatus={refreshProblemStatus}
                finishTraining={finishTraining}
                submissionStatuses={submissionStatuses}
                display={{
                  showRatings: effectiveShowRatings,
                  hideContestDetails: hideContestDetails,
                }}
                onProblemOpen={notifyProblemOpened}
                isPoolLoading={isLoading}
                onExtendEndTime={extendEndTime}
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pb-20 pt-0 font-mono text-emerald-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] space-y-6">
        <UpsolveReminder />

        {/* Command sequence block */}
        <div className="bg-[#050907] border border-emerald-500/15 rounded-lg p-4 font-mono text-xs text-emerald-500 select-none">
          <div className="flex items-center gap-1 text-[10px]">
            <span className="text-emerald-400 font-bold">guest@upsolve.it:~$</span>
            <span>./initiate_training_run.sh --handle={user.codeforcesHandle}</span>
          </div>
          <p className="text-[10px] text-emerald-500/60 mt-1.5 uppercase">
            &gt;&gt; Initializing Contest Compiler v3.1... Select module parameters below to build the session binary.
          </p>
        </div>

        {/* Section 1: Mode Config */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#040706] shadow-[0_0_20px_rgba(16,185,129,0.02)]">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.08]" />
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
            <div className="flex items-center gap-2">
              <Settings size={11} className="text-emerald-400" />
              <span>STEP 01 // CHOOSE CONTEST MODE PROTOCOL</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-500/50 uppercase">[ MODE_SECTOR ]</span>
          </div>
          <div className="p-6 relative z-10 bg-[#040706]/95">
            <ModeSelector value={selectedMode} onChange={setSelectedMode} />
          </div>
        </div>

        {/* Section 2: Level Adjuster */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#040706] shadow-[0_0_20px_rgba(16,185,129,0.02)]">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.08]" />
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
            <div className="flex items-center gap-2">
              <Flame size={11} className="text-emerald-400" />
              <span>STEP 02 // ADJUST ROADMAP LEVEL CALIBRATION</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-500/50 uppercase">[ LEVEL_SECTOR ]</span>
          </div>
          <div className="p-6 relative z-10 bg-[#040706]/95">
            <LevelSelector
              onLevelChange={handleLevelChange}
              currentRatings={customRatings}
              showRatings={showRatings}
              setShowRatings={setShowRatings}
            />
          </div>
        </div>

        {/* Section 3: Tag Filtering */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#040706] shadow-[0_0_20px_rgba(16,185,129,0.02)]">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.08]" />
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
            <div className="flex items-center gap-2">
              <Tag size={11} className="text-emerald-400" />
              <span>STEP 03 // TARGET FILTER TOPIC TAGS (OPTIONAL)</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-500/50 uppercase">[ TAGS_SECTOR ]</span>
          </div>
          <div className="p-6 relative z-10 bg-[#040706]/95">
            <TagSelector
              allTags={allTags}
              selectedTags={selectedTags}
              onTagClick={onTagClick}
              onClearTags={onClearTags}
            />
          </div>
        </div>

        {/* Section 4: Trainer Compiler */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#040706] shadow-[0_0_20px_rgba(16,185,129,0.02)]">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.08]" />
          {/* Header bar */}
          <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[9px] text-emerald-500/40">
            <div className="flex items-center gap-2">
              <Terminal size={11} className="text-emerald-400" />
              <span>STEP 04 // RUN COMPILER AND COMPILE SESSION BINARY</span>
            </div>
            <span className="text-[8px] font-bold text-emerald-500/50 uppercase">[ LAUNCH_SECTOR ]</span>
          </div>
          <div className="p-6 relative z-10 bg-[#040706]/95">
            <Trainer
              status={isRefreshing ? "refreshing" : isTraining ? "training" : "idle"}
              training={training}
              problems={problems}
              onGenerateProblems={handleGenerateProblems}
              onStartSession={handleStartSession}
              stopTraining={stopTraining}
              refreshProblemStatus={refreshProblemStatus}
              finishTraining={finishTraining}
              submissionStatuses={submissionStatuses}
              display={{
                showRatings: effectiveShowRatings,
                hideContestDetails: hideContestDetails,
              }}
              onProblemOpen={notifyProblemOpened}
              isPoolLoading={isLoading}
              onExtendEndTime={extendEndTime}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

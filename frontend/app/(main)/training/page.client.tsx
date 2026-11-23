"use client";

import { useTraining, useTags } from "@/hooks/training";
import {
  Trainer,
  TagSelector,
  LevelSelector,
  ModeSelector,
} from "@/components/features/training";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { ArrowUpRight, CircleDot } from "lucide-react";
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
    finishError,
    isFinishing,
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

  const handleLevelChange = useCallback(
    (ratings: { P1: number; P2: number; P3: number; P4: number }) => {
      setCustomRatings(ratings);
    },
    [],
  );

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
      weaknessFallback: selectedMode === "weakness" ? weaknessFallback : false,
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

  const effectiveShowRatings = selectedMode === "contest" ? false : showRatings;

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
      <section className="min-h-screen pb-20 font-sans text-[#f1f3ee]">
        <div className="container mx-auto max-w-[1400px] space-y-7 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-sm text-[#929b98]">Your training space</p>
              <h1 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
                {modeLabel}
              </h1>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#b5e3c4]/20 bg-[#b5e3c4]/5 px-4 py-2 text-xs text-[#b5e3c4]">
              <span className="size-1.5 rounded-full bg-[#b5e3c4]" />
              Session in progress
            </div>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-[#2b3031] bg-[#191c1e] p-4 sm:p-6">
            <Trainer
              status={
                isRefreshing ? "refreshing" : isTraining ? "training" : "idle"
              }
              training={training}
              problems={problems}
              onGenerateProblems={handleGenerateProblems}
              onStartSession={handleStartSession}
              stopTraining={stopTraining}
              refreshProblemStatus={refreshProblemStatus}
              finishTraining={finishTraining}
              finishError={finishError}
              isFinishing={isFinishing}
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
      </section>
    );
  }

  return (
    <section className="min-h-screen pb-20 font-sans text-[#f1f3ee]">
      <div className="container mx-auto max-w-[1400px] space-y-6 px-4 sm:px-6 lg:px-8">
        <UpsolveReminder />

        <header className="flex flex-wrap items-end justify-between gap-6 pb-4 pt-2 sm:pb-6">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm text-[#929b98]">
              <CircleDot className="size-4 text-[#b5e3c4]" aria-hidden="true" />
              The training room
            </div>
            <h1 className="max-w-3xl font-heading text-4xl font-medium leading-[1.1] tracking-[-0.04em] sm:text-5xl">
              Make room for progress.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#929b98] sm:text-base">
              Choose your focus. Find your challenge. Turn a little practice
              into lasting progress.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#2b3031] bg-[#191c1e] px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#b5e3c4]/10 text-[#b5e3c4]">
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#929b98]">Training as</p>
              <p className="mt-0.5 text-sm font-medium">
                {user.codeforcesHandle}
              </p>
            </div>
          </div>
        </header>

        <section
          aria-labelledby="training-mode-heading"
          className="rounded-[1.5rem] border border-[#2b3031] bg-[#191c1e] p-5 sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#39403c] text-xs text-[#929b98]">
              1
            </span>
            <h2
              id="training-mode-heading"
              className="font-heading text-xl font-medium tracking-tight"
            >
              Choose your session
            </h2>
          </div>
          <ModeSelector value={selectedMode} onChange={setSelectedMode} />
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section
            aria-labelledby="training-level-heading"
            className="min-w-0 rounded-[1.5rem] border border-[#2b3031] bg-[#191c1e] p-5 sm:p-7"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#39403c] text-xs text-[#929b98]">
                2
              </span>
              <h2
                id="training-level-heading"
                className="font-heading text-xl font-medium tracking-tight"
              >
                Find your challenge
              </h2>
            </div>
            <LevelSelector
              onLevelChange={handleLevelChange}
              currentRatings={customRatings}
              showRatings={showRatings}
              setShowRatings={setShowRatings}
            />
          </section>

          <section
            aria-labelledby="training-topics-heading"
            className="min-w-0 rounded-[1.5rem] border border-[#2b3031] bg-[#191c1e] p-5 sm:p-7"
          >
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#39403c] text-xs text-[#929b98]">
                3
              </span>
              <h2
                id="training-topics-heading"
                className="font-heading text-xl font-medium tracking-tight"
              >
                Set your focus
              </h2>
              <span className="ml-auto text-xs text-[#929b98]">Optional</span>
            </div>
            <TagSelector
              allTags={allTags}
              selectedTags={selectedTags}
              onTagClick={onTagClick}
              onClearTags={onClearTags}
            />
          </section>
        </div>

        <section
          aria-labelledby="training-preview-heading"
          className="overflow-hidden rounded-[1.5rem] border border-[#2b3031] bg-[#191c1e] p-5 sm:p-7"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#39403c] text-xs text-[#929b98]">
              4
            </span>
            <div>
              <h2
                id="training-preview-heading"
                className="font-heading text-xl font-medium tracking-tight"
              >
                Your next session
              </h2>
              <p className="mt-1 text-sm text-[#929b98]">
                Generate your problem set, then start when you’re ready.
              </p>
            </div>
          </div>
          <Trainer
            status={
              isRefreshing ? "refreshing" : isTraining ? "training" : "idle"
            }
            training={training}
            problems={problems}
            onGenerateProblems={handleGenerateProblems}
            onStartSession={handleStartSession}
            stopTraining={stopTraining}
            refreshProblemStatus={refreshProblemStatus}
            finishTraining={finishTraining}
            finishError={finishError}
            isFinishing={isFinishing}
            submissionStatuses={submissionStatuses}
            display={{
              showRatings: effectiveShowRatings,
              hideContestDetails: hideContestDetails,
            }}
            onProblemOpen={notifyProblemOpened}
            isPoolLoading={isLoading}
            onExtendEndTime={extendEndTime}
          />
        </section>
      </div>
    </section>
  );
}

"use client";

import { useTraining, useTags } from "@/hooks/training";
import { Trainer, TagSelector, LevelSelector, ModeSelector } from "@/components/features/training";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { Flame } from "lucide-react";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { m } from "framer-motion";
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

  const handleLevelChange = (ratings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  }) => {
    setCustomRatings(ratings);
  };

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

  const hideContestDetails =
    training?.trainingMode === "contest" ||
    (isTraining && selectedMode === "contest");

  // Block only on auth/client init — problems fetch runs in background while UI renders.
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
      <section className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/[0.02] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.012]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-10">
          <div className="max-w-[1400px] mx-auto">
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-6 lg:mb-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md" />
                    <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Live</span>
                    </div>
                  </div>
                  <h1 className="text-lg font-semibold text-foreground">{modeLabel}</h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Focus and solve each problem with precision
                </p>
              </div>
            </m.div>

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
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        <UpsolveReminder />

        <m.div
          className="text-center space-y-6 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
            Professional Training
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[0.95]">
            Create Your <span className="gradient-text">Contest</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pick a training mode, tune level and topics, then generate a set
            and start.
          </p>
        </m.div>

        <div className="grid gap-12 lg:gap-16 max-w-5xl mx-auto space-y-16">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Flame className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Training mode
              </h3>
            </div>
            <ModeSelector value={selectedMode} onChange={setSelectedMode} />
          </section>

          <section className="space-y-8">
            <m.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <LevelSelector
                onLevelChange={handleLevelChange}
                currentRatings={customRatings}
                showRatings={showRatings}
                setShowRatings={setShowRatings}
              />
            </m.div>
          </section>

          <m.section
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                  <Flame className="size-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Target Tags
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
                Optional
              </span>
            </div>

            <Card className="border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 sm:p-8">
                  <TagSelector
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagClick={onTagClick}
                    onClearTags={onClearTags}
                  />
                </div>
              </CardContent>
            </Card>
          </m.section>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-4"
          >
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
            />
          </m.div>
        </div>
      </div>
    </section>
  );
}

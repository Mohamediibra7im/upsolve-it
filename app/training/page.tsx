"use client";

import useTraining from "@/hooks/useTraining";
import Trainer from "./_Components/Trainer";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import TagSelector from "./_Components/TagSelector";
import LevelSelector from "./_Components/LevelSelector";
import useTags from "@/hooks/useTags";
import useUser from "@/hooks/useUser";
import Loader from "@/components/shared/Loader";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import ModeSelector from "./_Components/ModeSelector";
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

  if (isLoading) return <Loader />;
  if (!user) return <Loader />;

  if (isTraining) {
    return (
      <section className="min-h-screen relative overflow-hidden py-12 sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background/95 to-background" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 lg:space-y-16">
          <UpsolveReminder />

          <motion.div
            className="text-center space-y-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Active Session
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
                Master the <span className="text-primary italic">Grind</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto opacity-80">
                You are in focused mode. Eliminate distractions, analyze each
                problem carefully, and break your limits.
              </p>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <Trainer
              isTraining={isTraining}
              training={training}
              problems={problems}
              onGenerateProblems={handleGenerateProblems}
              onStartSession={handleStartSession}
              stopTraining={stopTraining}
              refreshProblemStatus={refreshProblemStatus}
              finishTraining={finishTraining}
              submissionStatuses={submissionStatuses}
              isRefreshing={isRefreshing}
              showRatings={effectiveShowRatings}
              hideContestDetails={hideContestDetails}
              onProblemOpen={notifyProblemOpened}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen relative overflow-hidden pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
        <UpsolveReminder />

        <motion.div
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
        </motion.div>

        <div className="grid gap-12 lg:gap-16 max-w-5xl mx-auto space-y-16">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Training mode
              </h3>
            </div>
            <ModeSelector value={selectedMode} onChange={setSelectedMode} />
          </section>

          <section className="space-y-8">
            <motion.div
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
            </motion.div>
          </section>

          <motion.section
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                  <Flame className="w-5 h-5" />
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
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="pt-4"
          >
            <Trainer
              isTraining={isTraining}
              training={training}
              problems={problems}
              onGenerateProblems={handleGenerateProblems}
              onStartSession={handleStartSession}
              stopTraining={stopTraining}
              refreshProblemStatus={refreshProblemStatus}
              finishTraining={finishTraining}
              submissionStatuses={submissionStatuses}
              isRefreshing={isRefreshing}
              showRatings={effectiveShowRatings}
              hideContestDetails={hideContestDetails}
              onProblemOpen={notifyProblemOpened}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

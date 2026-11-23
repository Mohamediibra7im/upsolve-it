"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import useSWR from "swr";
import { X } from "lucide-react";
import { useTraining, useTags, type Level } from "@/hooks/training";
import { useUser } from "@/hooks/auth";
import {
  Trainer,
  TagSelector,
  LevelSelector,
  ModeSelector,
  ProblemsCard,
} from "@/components/features/training";
import Loader from "@/components/shared/Loader";
import UpsolveReminder from "@/components/shared/UpsolveReminder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHead } from "@/components/ui/kit";
import { useToast } from "@/components/providers/Toast";
import { swrFetcher } from "@/lib/apiClient";
import type { TrainingMode } from "@/types/TrainingMode";
import {
  buildRatingsForMode,
  customRatingsFromProblems,
} from "@/services/training/modeRatings";

type WeaknessApi = {
  hasEnoughData: boolean;
  weakTags: { tag: string; score: number }[];
};

/** These modes take their ratings from your Codeforces rating, not the level. */
const LEVEL_NOTE: Partial<Record<TrainingMode, string>> = {
  speed:
    "Speed round picks ratings just below your Codeforces rating, so the level does not change this set.",
  contest:
    "Contest picks ratings around your Codeforces rating and keeps them hidden, so the level does not change this set.",
  endurance:
    "Endurance picks ratings around your Codeforces rating, so the level does not change this set.",
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

  // With an AtCoder username, each slot of a set is as likely to come from
  // AtCoder as from Codeforces. AtCoder problems carry no tags, so a set drawn
  // by tag is Codeforces only.
  const hasAtcoder = !!user?.links?.atcoder?.trim();
  const tagged = selectedTags.length > 0 || selectedMode === "weakness";
  const mixesAtcoder = hasAtcoder && !tagged;

  const [showRatings, setShowRatings] = useState(false);
  const [level, setLevel] = useState<Level>();

  const { data: weakness } = useSWR<WeaknessApi>(
    user ? "/api/users/me/weaknesses" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const handleLevelChange = useCallback((next: Level) => {
    setLevel(next);
    setCustomRatings({
      P1: Number.parseInt(next.P1, 10),
      P2: Number.parseInt(next.P2, 10),
      P3: Number.parseInt(next.P3, 10),
      P4: Number.parseInt(next.P4, 10),
    });
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
          variant: "warning",
          description:
            "The problem library is loading in the background. Wait a few seconds, then generate again.",
        });
      } else {
        toast({
          title: "No problems matched",
          variant: "warning",
          description:
            "Try other topics, another level or another mode. Some combinations leave no problems at those ratings.",
        });
      }
    };

    if (selectedMode === "weakness") {
      if (!weakness?.hasEnoughData || !weakness.weakTags?.length) {
        toast({
          title: "Not enough history for Weakness yet",
          variant: "warning",
          description:
            "Finish a few more sessions first. This set uses ladder problems.",
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
      // a coin per slot: how many of this set go to AtCoder
      mixesAtcoder ? base.ratings.filter(() => Math.random() < 0.5).length : 0,
    );
    reportGenerate(r);
  }, [
    mixesAtcoder,
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

  if (isInitializing || !user) return <Loader />;

  return (
    <>
      {/* a running session is its own page: the workspace, edge to edge */}
      {!(isTraining && training) && (
        <PageHead eyebrow="The training room" title="Make room for progress.">
          <span className="t-muted">
            Training as <b className="text-ink">{user.codeforcesHandle}</b>
          </span>
        </PageHead>
      )}

      <div className="grid gap-6">
        {finishError && (
          <div
            role="alert"
            className="u-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Badge variant="failed">
                <X aria-hidden="true" />
                Not saved
              </Badge>
              {finishError} Your session is still saved on this device.
            </p>
            <Button
              variant="outline"
              onClick={() => void finishTraining()}
              disabled={isFinishing}
            >
              {isFinishing ? "Saving…" : "Save session again"}
            </Button>
          </div>
        )}

        {isTraining && training ? (
          <Trainer
            training={training}
            isRefreshing={isRefreshing}
            submissionStatuses={submissionStatuses}
            refreshProblemStatus={refreshProblemStatus}
            finishTraining={finishTraining}
            stopTraining={stopTraining}
            onProblemOpen={notifyProblemOpened}
            onExtendEndTime={extendEndTime}
          />
        ) : (
          <>
            <UpsolveReminder />
            <ModeSelector
              value={selectedMode}
              onChange={setSelectedMode}
              ready={problems.length > 0}
            >
              <div className="grid gap-3.5 px-4 pb-5 sm:px-6">
                <LevelSelector
                  onLevelChange={handleLevelChange}
                  currentRatings={customRatings}
                  note={LEVEL_NOTE[selectedMode]}
                />
                <p className="t-sm t-muted">
                  {mixesAtcoder ? (
                    "Sets mix in AtCoder problems at random. A rating marked ≈ is an estimate."
                  ) : hasAtcoder ? (
                    "Sets drawn by tag come from Codeforces only: AtCoder problems have no tags."
                  ) : (
                    <>
                      Want AtCoder problems mixed into your sets?{" "}
                      <Link href="/settings" className="t-link">
                        Add your AtCoder username
                      </Link>{" "}
                      in Settings.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div
                    className="u-seg"
                    role="group"
                    aria-label="Problem ratings"
                  >
                    <button
                      type="button"
                      aria-pressed={showRatings}
                      onClick={() => setShowRatings(true)}
                    >
                      Show ratings
                    </button>
                    <button
                      type="button"
                      aria-pressed={!showRatings}
                      onClick={() => setShowRatings(false)}
                    >
                      Hide ratings
                    </button>
                  </div>
                  <TagSelector
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagClick={onTagClick}
                    onClearTags={onClearTags}
                  />
                </div>
              </div>
              <ProblemsCard
                problems={problems}
                showRatings={selectedMode !== "contest" && showRatings}
                isPoolLoading={isLoading}
                slots={selectedMode === "endurance" ? 6 : 4}
                level={LEVEL_NOTE[selectedMode] ? undefined : level}
                onGenerateProblems={handleGenerateProblems}
                onStartSession={handleStartSession}
              />
            </ModeSelector>
          </>
        )}
      </div>
    </>
  );
}

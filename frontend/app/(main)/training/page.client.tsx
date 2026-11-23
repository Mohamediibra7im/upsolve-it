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

  // How many problems of a set come from AtCoder; the rest are Codeforces.
  const [atcoderCount, setAtcoderCount] = useState(() => {
    if (globalThis.window === undefined) return 0;
    const stored = Number(localStorage.getItem("training-tracker-atcoder"));
    return Number.isInteger(stored) && stored > 0 ? stored : 0;
  });
  useEffect(() => {
    localStorage.setItem("training-tracker-atcoder", String(atcoderCount));
  }, [atcoderCount]);
  const hasAtcoder = !!user?.links?.atcoder?.trim();
  const slots = selectedMode === "endurance" ? 6 : 4;
  // AtCoder problems carry no tags, so a set drawn by tag is Codeforces only.
  const tagged = selectedTags.length > 0 || selectedMode === "weakness";
  const atcoderWanted =
    hasAtcoder && !tagged ? Math.min(atcoderCount, slots) : 0;

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
      atcoder?: number;
      reason?: "pool-not-ready" | "empty-result";
    }) => {
      if (result.ok) {
        const got = result.atcoder ?? 0;
        if (got < atcoderWanted)
          toast({
            title:
              got === 0
                ? "No AtCoder problem fit this set"
                : `Only ${got} AtCoder ${got === 1 ? "problem" : "problems"} fit this set`,
            variant: "warning",
            description:
              "AtCoder had nothing unsolved near the other ratings, or its list is still loading. The rest come from Codeforces.",
          });
        return;
      }
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
      atcoderWanted,
    );
    reportGenerate(r);
  }, [
    atcoderWanted,
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
      <PageHead eyebrow="The training room" title="Make room for progress.">
        <span className="t-muted">
          Training as <b className="text-ink">{user.codeforcesHandle}</b>
        </span>
      </PageHead>

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
                {hasAtcoder ? (
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <span className="grid gap-0.5">
                      <span className="u-stat__label" id="atcoder-count">
                        AtCoder problems in this set
                      </span>
                      <span className="t-sm t-muted">
                        {tagged
                          ? selectedMode === "weakness"
                            ? "Weakness sets are drawn by tag, so they come from Codeforces only."
                            : "Tags are chosen, so this set comes from Codeforces only."
                          : "The rest come from Codeforces. A rating marked ≈ is an estimate."}
                      </span>
                    </span>
                    <div
                      className="u-seg max-w-full overflow-x-auto"
                      role="group"
                      aria-labelledby="atcoder-count"
                    >
                      {Array.from({ length: slots + 1 }, (_, n) => (
                        <button
                          key={n}
                          type="button"
                          className="t-num disabled:cursor-not-allowed disabled:opacity-50"
                          aria-pressed={
                            (tagged ? 0 : Math.min(atcoderCount, slots)) === n
                          }
                          disabled={tagged}
                          onClick={() => setAtcoderCount(n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="t-sm t-muted">
                    Want AtCoder problems in your sets?{" "}
                    <Link href="/settings" className="t-link">
                      Add your AtCoder username
                    </Link>{" "}
                    in Settings.
                  </p>
                )}
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

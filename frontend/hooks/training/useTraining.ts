import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/auth/useUser";
import useProblems from "./useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/data/useHistory";
import getTrainingSubmissionStatus, {
  SubmissionStatus,
} from "@/services/codeforces/getTrainingSubmissionStatus";
import { apiClient } from "@/lib/apiClient";
import { mutate as mutateSwr } from "swr";
import type { TrainingMode } from "@/types/TrainingMode";
import { expectedTimeSecondsFromRating } from "@/services/training/expectedTime";
import { computeSpeedStatus } from "@/services/training/speedStatus";
import {
  SUBMISSION_STATUS_STORAGE_KEY,
  TRAINING_STORAGE_KEY,
} from "@/services/training/roomTraining";
import { sessionPayload } from "@/services/training/sessionPayload";
import { endBreak, startBreak } from "@/services/training/breaks";

function buildProblemUpdates(
  training: Training,
  problems: TrainingProblem[],
  statuses: SubmissionStatus[],
): Record<string, Record<string, unknown>> {
  const map: Record<string, Record<string, unknown>> = {};
  for (const problem of problems) {
    const problemId =
      problem.problemId ?? `${problem.contestId}_${problem.index}`;
    const st = statuses.find((s) => s.problemId === problemId);
    const start = problem.startedAt ?? training.startTime;
    const isSolved =
      st?.status === "AC" ||
      problem.isSolved === true ||
      (problem.solvedTime ?? problem.solvedAt ?? 0) > 0;
    const solvedAt =
      st?.status === "AC"
        ? (st.lastSubmissionTime ?? problem.solvedTime)
        : (problem.solvedTime ?? problem.solvedAt ?? undefined);
    const timeSpentSeconds =
      isSolved && solvedAt != null
        ? Math.max(0, Math.round((solvedAt - start) / 1000))
        : null;
    map[problemId] = {
      attempts: st?.attempts ?? problem.attempts ?? 0,
      isSolved,
      solvedAt: solvedAt ?? null,
      solvedTime: solvedAt ?? null,
      timeSpentSeconds,
    };
  }
  return map;
}

const useTraining = () => {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();
  const {
    isLoading: isProblemsLoading,
    getRandomProblems,
    getRandomProblemsFromRatings,
  } = useProblems(user);
  const { addTraining } = useHistory();

  const [isClient, setIsClient] = useState(false);
  const [problems, setProblems] = useState<TrainingProblem[]>([]);
  const [training, setTraining] = useState<Training | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [submissionStatuses, setSubmissionStatuses] = useState<
    SubmissionStatus[]
  >([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const finishing = useRef(false);
  const refreshing = useRef(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const pushSessionSync = useCallback(
    async (
      t: Training,
      probs: TrainingProblem[],
      statuses: SubmissionStatus[],
    ) => {
      if (!t.serverSessionId) return;
      const problemUpdates = buildProblemUpdates(t, probs, statuses);
      try {
        await apiClient.post(
          `/api/training-sessions/${t.serverSessionId}/sync`,
          { problemUpdates },
        );
      } catch (e) {
        console.error("[sync session]", e);
      }
    },
    [],
  );

  /**
   * Reads this person's verdicts from the judges and updates the session.
   * One read at a time; a judge that does not answer in fifteen seconds
   * counts as a failed read. Resolves to whether the verdicts were read.
   */
  const refreshProblemStatus = useCallback(async (): Promise<boolean> => {
    if (!user || !training || !isTraining || refreshing.current) return false;
    refreshing.current = true;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error("The judge took too long to answer.")),
        15000,
      );
    });

    setIsRefreshing(true);
    try {
      const statusResponse = await Promise.race([
        getTrainingSubmissionStatus(
          user,
          training.problems,
          training.startTime,
        ),
        timedOut,
      ]);

      if (statusResponse.success) {
        const newStatuses = statusResponse.data;
        setSubmissionStatuses(newStatuses);

        if (isClient) {
          localStorage.setItem(
            SUBMISSION_STATUS_STORAGE_KEY,
            JSON.stringify(newStatuses),
          );
        }

        const solvedProblemIds = new Set(
          newStatuses.filter((s) => s.status === "AC").map((s) => s.problemId),
        );

        const updatedProblems = training.problems.map((problem) => {
          const problemId =
            problem.problemId ?? `${problem.contestId}_${problem.index}`;
          const isSolved =
            solvedProblemIds.has(problemId) ||
            problem.isSolved === true ||
            (problem.solvedTime ?? problem.solvedAt ?? 0) > 0;
          const submission = newStatuses.find((s) => s.problemId === problemId);
          const start = problem.startedAt ?? training.startTime;
          const solvedT = isSolved
            ? (problem.solvedTime ??
              submission?.lastSubmissionTime ??
              Date.now())
            : null;
          const timeSpentSeconds =
            isSolved && solvedT != null
              ? Math.max(0, Math.round((solvedT - start) / 1000))
              : null;
          const expected =
            problem.expectedTimeSeconds ??
            expectedTimeSecondsFromRating(problem.rating ?? 0);
          return {
            ...problem,
            solvedTime: isSolved ? solvedT : null,
            isSolved,
            attempts: submission?.attempts ?? problem.attempts,
            timeSpentSeconds,
            expectedTimeSeconds: expected,
            speedStatus: computeSpeedStatus(
              isSolved,
              timeSpentSeconds,
              expected,
            ),
          };
        });

        if (
          JSON.stringify(updatedProblems) !== JSON.stringify(training.problems)
        ) {
          setTraining((prev) =>
            prev ? { ...prev, problems: updatedProblems } : null,
          );
        }

        setLastCheckedAt(Date.now());
        await pushSessionSync(training, updatedProblems, newStatuses);
        return true;
      }
      console.error("Failed to fetch submission status:", statusResponse.error);
      return false;
    } catch (error: unknown) {
      console.error("Failed to refresh problem status:", error);
      return false;
    } finally {
      clearTimeout(timeoutId);
      refreshing.current = false;
      setIsRefreshing(false);
    }
  }, [user, training, isTraining, isClient, pushSessionSync]);

  // Verdicts are read without being asked: when the person comes back to this
  // tab (usually from the judge, having just submitted) and every ninety
  // seconds while it is in view. Never during a break or before the start,
  // and never twice within fifteen seconds.
  const latestRefresh = useRef(refreshProblemStatus);
  useEffect(() => {
    latestRefresh.current = refreshProblemStatus;
  }, [refreshProblemStatus]);
  const lastAuto = useRef(0);
  const sessionStart = training?.startTime;
  const breakUntil = training?.breakUntil;
  useEffect(() => {
    if (!isTraining || sessionStart === undefined) return;
    const read = () => {
      const now = Date.now();
      if (
        document.visibilityState !== "visible" ||
        now < sessionStart ||
        now < (breakUntil ?? 0) ||
        now - lastAuto.current < 15_000
      )
        return;
      lastAuto.current = now;
      void latestRefresh.current();
    };
    document.addEventListener("visibilitychange", read);
    const timer = setInterval(read, 90_000);
    return () => {
      document.removeEventListener("visibilitychange", read);
      clearInterval(timer);
    };
  }, [isTraining, sessionStart, breakUntil]);

  const finishTraining = useCallback(async () => {
    if (!training || finishing.current) return;
    finishing.current = true;
    setIsFinishing(true);
    setFinishError(null);
    const clearSavedTraining = () => {
      setIsTraining(false);
      setProblems([]);
      setTraining(null);
      setSubmissionStatuses([]);
      if (isClient) {
        localStorage.removeItem(TRAINING_STORAGE_KEY);
        localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
      }
    };
    try {
      const now = Date.now();
      const isPreContestPeriod = now < training.startTime;

      if (isPreContestPeriod) {
        setProblems([]);
        setTraining(null);
        setSubmissionStatuses([]);
        if (isClient) {
          localStorage.removeItem(TRAINING_STORAGE_KEY);
          localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
        }
        router.push("/training");
        return;
      }

      const currentTraining = { ...training };

      if (!user)
        throw new Error("Please log in again before saving this training.");

      const statusResponse = await getTrainingSubmissionStatus(
        user,
        currentTraining.problems,
        currentTraining.startTime,
      );

      let finalProblems = currentTraining.problems;
      let finalStatuses: SubmissionStatus[] = [];
      if (statusResponse.success) {
        finalStatuses = statusResponse.data;
        const newStatuses = statusResponse.data;
        const solvedProblemIds = new Set(
          newStatuses.filter((s) => s.status === "AC").map((s) => s.problemId),
        );
        finalProblems = currentTraining.problems.map((problem) => {
          const problemId =
            problem.problemId ?? `${problem.contestId}_${problem.index}`;
          const isSolved =
            solvedProblemIds.has(problemId) ||
            problem.isSolved === true ||
            (problem.solvedTime ?? problem.solvedAt ?? 0) > 0;
          const submission = newStatuses.find((s) => s.problemId === problemId);
          const start = problem.startedAt ?? currentTraining.startTime;
          const solvedT = isSolved
            ? (problem.solvedTime ??
              submission?.lastSubmissionTime ??
              Date.now())
            : null;
          const timeSpentSeconds =
            isSolved && solvedT != null
              ? Math.max(0, Math.round((solvedT - start) / 1000))
              : null;
          const expected =
            problem.expectedTimeSeconds ??
            expectedTimeSecondsFromRating(problem.rating ?? 0);
          return {
            ...problem,
            solvedTime: isSolved ? solvedT : null,
            isSolved,
            attempts: submission?.attempts ?? problem.attempts,
            timeSpentSeconds,
            expectedTimeSeconds: expected,
            speedStatus: computeSpeedStatus(
              isSolved,
              timeSpentSeconds,
              expected,
            ),
          };
        });
      }

      if (currentTraining.serverSessionId) {
        const problemUpdates = buildProblemUpdates(
          { ...currentTraining, problems: finalProblems },
          finalProblems,
          finalStatuses,
        );
        await apiClient.post(
          `/api/training-sessions/${currentTraining.serverSessionId}/end`,
          {
            endTime: Date.now(),
            problemUpdates,
          },
        );
        clearSavedTraining();
        void mutateSwr("/api/trainings").catch(console.error);
        router.push(
          `/training/session/${currentTraining.serverSessionId}/review`,
        );
        return;
      }

      await addTraining({ ...currentTraining, problems: finalProblems });
      clearSavedTraining();
      router.push("/statistics");
    } catch (error) {
      setFinishError(
        error instanceof Error
          ? error.message
          : "Training could not be saved. Please retry.",
      );
    } finally {
      finishing.current = false;
      setIsFinishing(false);
    }
  }, [training, addTraining, router, isClient, user]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!isClient) return;

    const localTraining = localStorage.getItem(TRAINING_STORAGE_KEY);
    if (localTraining) {
      const parsed = JSON.parse(localTraining);
      setTraining(parsed);
    }

    const localSubmissionStatuses = localStorage.getItem(
      SUBMISSION_STATUS_STORAGE_KEY,
    );
    if (localSubmissionStatuses) {
      setSubmissionStatuses(JSON.parse(localSubmissionStatuses));
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !training) {
      return;
    }

    localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(training));
    const now = Date.now();
    const timeLeft = training.endTime - now;

    if (timeLeft <= 0) {
      void finishTraining();
      return;
    }

    setIsTraining(now <= training.endTime);

    const timer = setTimeout(() => void finishTraining(), timeLeft);

    return () => {
      clearTimeout(timer);
    };
  }, [training, isClient, finishTraining]);

  const startTraining = useCallback(
    async (opts: {
      customRatings: Training["customRatings"];
      trainingMode: TrainingMode;
      durationMinutes: number;
      showRatings: boolean;
      weaknessFallback?: boolean;
      level?: string;
      tags?: string[];
    }) => {
      if (!user) {
        router.push("/");
        return;
      }

      const preContestDuration = 10 * 1000;
      const startTime = Date.now() + preContestDuration;
      const endTime = startTime + opts.durationMinutes * 60000;

      const baseTraining: Training = {
        startTime,
        endTime,
        customRatings: opts.customRatings,
        problems,
        performance: 0,
        trainingMode: opts.trainingMode,
        showRatings: opts.showRatings,
        durationMinutes: opts.durationMinutes,
        weaknessFallback: opts.weaknessFallback,
        level: opts.level ?? "",
      };

      let serverSessionId: string | undefined;
      try {
        const payload = sessionPayload(baseTraining, opts.tags ?? []);
        const res = await apiClient.post<{ sessionId: string }>(
          "/api/training-sessions",
          payload,
        );
        serverSessionId = res.sessionId;
      } catch (e) {
        console.error("[training-sessions create]", e);
      }

      setTraining({
        ...baseTraining,
        serverSessionId,
      });
    },
    [user, problems, router],
  );

  const stopTraining = () => {
    setIsTraining(false);
    setTraining(null);
    setSubmissionStatuses([]);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
      localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
    }
  };

  type GenerateResult =
    | { ok: true; count: number }
    | { ok: false; reason: "pool-not-ready" | "empty-result" };

  const generateProblems = (
    tags: ProblemTag[],
    lb: number | null,
    ub: number | null,
    customRatings: { P1: number; P2: number; P3: number; P4: number },
    atcoderCount = 0,
  ): GenerateResult => {
    const newProblems = getRandomProblems(
      tags,
      lb,
      ub,
      customRatings,
      atcoderCount,
    );
    if (newProblems === undefined) {
      return { ok: false, reason: "pool-not-ready" };
    }
    setProblems(newProblems);
    if (newProblems.length === 0) {
      return { ok: false, reason: "empty-result" };
    }
    return { ok: true, count: newProblems.length };
  };

  const generateProblemsFromRatings = (
    ratings: number[],
    tags: ProblemTag[],
    lb: number | null,
    ub: number | null,
    atcoderCount = 0,
  ): GenerateResult => {
    const newProblems = getRandomProblemsFromRatings(
      ratings,
      tags,
      lb,
      ub,
      atcoderCount,
    );
    if (newProblems === undefined) {
      return { ok: false, reason: "pool-not-ready" };
    }
    setProblems(newProblems);
    if (newProblems.length === 0) {
      return { ok: false, reason: "empty-result" };
    }
    return { ok: true, count: newProblems.length };
  };

  const notifyProblemOpened = useCallback(
    async (problem: TrainingProblem) => {
      if (!training?.serverSessionId) return;
      const id = encodeURIComponent(
        problem.problemId ?? `${problem.contestId}_${problem.index}`,
      );
      try {
        await apiClient.post(
          `/api/training-sessions/${training.serverSessionId}/problems/${id}/start`,
          {},
        );
        setTraining((prev) => {
          if (!prev) return null;
          const pid =
            problem.problemId ?? `${problem.contestId}_${problem.index}`;
          const next = prev.problems.map((p) => {
            const pKey = p.problemId ?? `${p.contestId}_${p.index}`;
            if (pKey !== pid) return p;
            if (p.startedAt != null) return p;
            return { ...p, startedAt: Date.now() };
          });
          return { ...prev, problems: next };
        });
      } catch (e) {
        console.error("[problem start]", e);
      }
    },
    [training?.serverSessionId],
  );

  // ponytail: break = extend endTime, no separate state needed
  // A break lives in the session, which is saved on this device whenever it
  // changes: it survives a reload and cannot be taken twice.
  const takeBreak = useCallback((minutes: number) => {
    setTraining((prev) =>
      prev ? startBreak(prev, minutes, Date.now()) : null,
    );
  }, []);
  const resumeFromBreak = useCallback(() => {
    setTraining((prev) => (prev ? endBreak(prev, Date.now()) : null));
  }, []);

  return {
    problems,
    isLoading: isUserLoading || isProblemsLoading || !isClient,
    isInitializing: isUserLoading || !isClient,
    isProblemsLoading,
    isRefreshing,
    isFinishing,
    finishError,
    training,
    isTraining,
    submissionStatuses,
    generateProblems,
    generateProblemsFromRatings,
    startTraining,
    stopTraining,
    refreshProblemStatus,
    finishTraining,
    notifyProblemOpened,
    takeBreak,
    resumeFromBreak,
    lastCheckedAt,
  };
};

export default useTraining;

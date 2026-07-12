import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/auth/useUser";
import useProblems from "./useProblems";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import { ProblemTag } from "@/types/Codeforces";
import useHistory from "@/hooks/data/useHistory";
import useUpsolvedProblems from "@/hooks/data/useUpsolvedProblems";
import getTrainingSubmissionStatus, {
  SubmissionStatus,
} from "@/services/codeforces/getTrainingSubmissionStatus";
import { apiClient } from "@/lib/apiClient";
import { mutate as mutateSwr } from "swr";
import type { TrainingMode } from "@/types/TrainingMode";
import { expectedTimeSecondsFromRating } from "@/services/training/expectedTime";
import { computeSpeedStatus } from "@/services/training/speedStatus";

const TRAINING_STORAGE_KEY = "training-tracker-training";
const SUBMISSION_STATUS_STORAGE_KEY = "training-tracker-submission-status";

function buildProblemUpdates(
  training: Training,
  problems: TrainingProblem[],
  statuses: SubmissionStatus[],
): Record<string, Record<string, unknown>> {
  const map: Record<string, Record<string, unknown>> = {};
  for (const problem of problems) {
    const problemId = problem.problemId ?? `${problem.contestId}_${problem.index}`;
    const st = statuses.find((s) => s.problemId === problemId);
    const start = problem.startedAt ?? training.startTime;
    const isSolved = st?.status === "AC" || problem.solvedTime != null;
    const solvedAt =
      st?.status === "AC"
        ? (st.lastSubmissionTime ?? problem.solvedTime)
        : (problem.solvedTime ?? undefined);
    const timeSpentSeconds =
      isSolved && solvedAt != null
        ? Math.max(0, Math.round((solvedAt - start) / 1000))
        : null;
    const expected =
      problem.expectedTimeSeconds ??
      expectedTimeSecondsFromRating(problem.rating ?? 0);
    const speed = computeSpeedStatus(
      Boolean(isSolved),
      timeSpentSeconds,
      expected,
    );
    map[problemId] = {
      attempts: st?.attempts ?? 0,
      isSolved,
      solvedAt: solvedAt ?? null,
      solvedTime: solvedAt ?? null,
      timeSpentSeconds,
      expectedTimeSeconds: expected,
      speedStatus: speed,
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
  const { addUpsolvedProblems } = useUpsolvedProblems();

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

  const pushSessionSync = useCallback(
    async (t: Training, probs: TrainingProblem[], statuses: SubmissionStatus[]) => {
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

  const refreshProblemStatus = useCallback(async () => {
    if (!user || !training || !isTraining || isRefreshing) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    setIsRefreshing(true);
    try {
      const statusResponse = await getTrainingSubmissionStatus(
        user,
        training.problems,
        training.startTime,
      );

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
          const problemId = problem.problemId ?? `${problem.contestId}_${problem.index}`;
          const isSolved = solvedProblemIds.has(problemId);
          const submission = newStatuses.find((s) => s.problemId === problemId);
          const start = problem.startedAt ?? training.startTime;
          const solvedT =
            isSolved
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

        await pushSessionSync(training, updatedProblems, newStatuses);
      } else {
        console.error(
          "Failed to fetch submission status:",
          statusResponse.error,
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error("Refresh timed out");
      } else {
        console.error("Failed to refresh problem status:", error);
      }
    } finally {
      clearTimeout(timeoutId);
      setIsRefreshing(false);
    }
  }, [user, training, isTraining, isClient, isRefreshing, pushSessionSync]);

  const finishTraining = useCallback(async () => {
    setIsTraining(false);

    if (!training) return;

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

    setProblems([]);
    setTraining(null);
    setSubmissionStatuses([]);
    if (isClient) {
      localStorage.removeItem(TRAINING_STORAGE_KEY);
      localStorage.removeItem(SUBMISSION_STATUS_STORAGE_KEY);
    }

    if (!user) {
      console.warn("[finishTraining] No user session found.");
      return;
    }

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
        const problemId = problem.problemId ?? `${problem.contestId}_${problem.index}`;
        const isSolved = solvedProblemIds.has(problemId);
        const submission = newStatuses.find((s) => s.problemId === problemId);
        const start = problem.startedAt ?? currentTraining.startTime;
        const solvedT =
          isSolved
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
      try {
        await apiClient.post(
          `/api/training-sessions/${currentTraining.serverSessionId}/end`,
          {
            endTime: Date.now(),
            problemUpdates,
          },
        );
        // Session lives in the same Training collection; refresh stats/history everywhere.
        await mutateSwr("/api/trainings");
      } catch (e) {
        console.error("[end session]", e);
      }
      router.push(
        `/training/session/${currentTraining.serverSessionId}/review`,
      );
      return;
    }

    await addTraining({ ...currentTraining, problems: finalProblems });
    const unsolvedProblems = finalProblems.filter((p) => !p.solvedTime);
    await addUpsolvedProblems(unsolvedProblems);

    router.push("/statistics");
  }, [training, addTraining, router, addUpsolvedProblems, isClient, user]);

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
        const payload = {
          trainingMode: opts.trainingMode,
          level: opts.level ?? "",
          tags: opts.tags ?? [],
          showRatings: opts.showRatings,
          weaknessFallback: opts.weaknessFallback ?? false,
          startTime,
          endTime,
          durationMinutes: opts.durationMinutes,
          customRatings: opts.customRatings,
          problems: problems.map((p) => ({
            problemId: p.problemId ?? `${p.contestId}_${p.index}`,
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating ?? 0,
            tags: p.tags,
            url: p.url,
            startedAt: p.startedAt,
            solvedAt: p.solvedAt,
            timeSpentSeconds: p.timeSpentSeconds,
            expectedTimeSeconds:
              p.expectedTimeSeconds ??
              expectedTimeSecondsFromRating(p.rating ?? 0),
            speedStatus: p.speedStatus,
            attempts: p.attempts,
            isSolved: p.isSolved,
            solvedTime: p.solvedTime,
          })),
        };
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
  ): GenerateResult => {
    const newProblems = getRandomProblems(tags, lb, ub, customRatings);
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
  ): GenerateResult => {
    const newProblems = getRandomProblemsFromRatings(ratings, tags, lb, ub);
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
          const pid = problem.problemId ?? `${problem.contestId}_${problem.index}`;
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
  const extendEndTime = useCallback(
    (minutes: number) => {
      setTraining((prev) => {
        if (!prev) return null;
        const next = { ...prev, endTime: prev.endTime + minutes * 60000 };
        if (isClient) localStorage.setItem(TRAINING_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [isClient],
  );

  return {
    problems,
    isLoading: isUserLoading || isProblemsLoading || !isClient,
    isInitializing: isUserLoading || !isClient,
    isProblemsLoading,
    isRefreshing,
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
    extendEndTime,
  };
};

export default useTraining;

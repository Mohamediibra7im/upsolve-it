import { useState, useCallback } from "react";
import useSWR from "swr";
import { Training } from "@/types/Training";
import useUser from "@/hooks/auth/useUser";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

const useHistory = () => {
  const { user } = useUser();
  const {
    data: history,
    error,
    mutate,
  } = useSWR<Training[]>(user ? "/api/trainings" : null, swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    dedupingInterval: 3000,
  });

  const addTraining = useCallback(
    async (training: Training) => {
      if (typeof window === "undefined") return;

      const fields = [
        "problemId",
        "contestId",
        "index",
        "name",
        "rating",
        "tags",
        "url",
        "startedAt",
        "solvedAt",
        "solvedTime",
        "timeSpentSeconds",
        "expectedTimeSeconds",
        "speedStatus",
        "attempts",
        "isSolved",
        "insightMessage",
        "recommendation",
      ];
      const payload = {
        startTime: training.startTime,
        endTime: training.endTime,
        customRatings: Object.fromEntries(
          Object.entries(training.customRatings ?? {}).filter(([key]) =>
            /^P[1-8]$/.test(key),
          ),
        ),
        problems: training.problems.map((problem) =>
          Object.fromEntries(
            Object.entries(problem).filter(([key]) => fields.includes(key)),
          ),
        ),
        trainingMode: training.trainingMode,
        weaknessFallback: training.weaknessFallback,
        showRatings: training.showRatings,
        durationMinutes: training.durationMinutes,
        level: training.level,
      };
      const result = await apiFetcher<{ training: Training }>(
        "/api/trainings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      // A cache refresh failure must not turn a successful save into a duplicate retry.
      void Promise.resolve(mutate()).catch(console.error);
      return result.training;
    },
    [mutate],
  );

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteTraining = useCallback(
    async (trainingId: string) => {
      if (isDeleting) return;

      setIsDeleting(trainingId);

      // Optimistic update
      mutate(
        (currentData = []) =>
          currentData.filter((training) => training._id !== trainingId),
        false,
      );

      try {
        await apiFetcher(`/api/trainings/${trainingId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error deleting training:", error);
        // Rollback on error
        mutate();
      } finally {
        setIsDeleting(null);
      }
    },
    [mutate, isDeleting],
  );

  return {
    history: history || [],
    isLoading: !!user && !error && !history,
    error,
    addTraining,
    deleteTraining,
    isDeleting,
    refresh: mutate,
  };
};

export default useHistory;

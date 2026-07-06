import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "@/hooks/auth/useUser";
import useSolvedProblems from "./useSolvedProblems";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

/** Shape of a dismissed-problem record returned by the API */
type DismissedProblemId = { contestId: number; index: string };

/** Combined response shape from GET /api/upsolve */
interface UpsolveResponse {
  items: TrainingProblem[];
  dismissed: DismissedProblemId[];
}

const useUpsolvedProblems = () => {
  const { user } = useUser();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useSolvedProblems(user);

  // ── Single SWR hook fetching combined { items, dismissed } ──────────
  const swrKey = user ? "/api/upsolve" : null;
  const { data, isLoading, error, mutate } = useSWR<UpsolveResponse>(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      dedupingInterval: 60_000,
    }
  );

  const upsolvedProblems = useMemo(() => data?.items ?? [], [data]);

  const dismissedProblems = useMemo(() => data?.dismissed ?? [], [data?.dismissed]);

  const dismissedIds = useMemo(() => {
    const set = new Set<string>();
    (data?.dismissed ?? []).forEach((d) => set.add(`${d.contestId}_${d.index}`));
    return set;
  }, [data?.dismissed]);

  // ── Add problems to upsolve queue ──────────────────────────────────
  const addUpsolvedProblems = useCallback(
    async (problems: TrainingProblem[]) => {
      if (problems.length === 0) return;

      mutate(
        (currentData) => ({
          items: [...(currentData?.items ?? []), ...problems],
          dismissed: currentData?.dismissed ?? [],
        }),
        false
      );

      try {
        await apiFetcher("/api/upsolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(problems),
        });
        mutate();
      } catch (error) {
        console.error("Failed to fetch upsolved problems:", error);
        mutate();
      }
    },
    [mutate]
  );

  // ── Dismiss (delete) a problem from upsolve queue ──────────────────
  const deleteUpsolvedProblem = useCallback(
    async (problem: TrainingProblem) => {
      mutate(
        (currentData) => ({
          items: (currentData?.items ?? []).filter(
            (p) => p.contestId !== problem.contestId || p.index !== problem.index
          ),
          dismissed: [
            ...(currentData?.dismissed ?? []),
            { contestId: problem.contestId, index: problem.index },
          ],
        }),
        false
      );

      try {
        await apiFetcher("/api/upsolve", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contestId: problem.contestId,
            index: problem.index,
          }),
        });
        mutate();
      } catch (error) {
        console.error("Failed to dismiss problem:", error);
        mutate();
      }
    },
    [mutate]
  );

  // ── Sync unsolved problems from training history ───────────────────
  const syncWithHistory = useCallback(
    async (history: Training[]) => {
      if (!history || history.length === 0) return;

      const allUnsolved = history.reduce((acc: TrainingProblem[], session) => {
        const unsolvedInSession = session.problems.filter((p) => !p.solvedTime);
        return [...acc, ...unsolvedInSession];
      }, []);

      if (allUnsolved.length === 0) return;

      const existingIds = new Set(
        upsolvedProblems.map((p) => `${p.contestId}_${p.index}`)
      );

      const missingProblems = allUnsolved.filter((p) => {
        const key = `${p.contestId}_${p.index}`;
        return !existingIds.has(key) && !dismissedIds.has(key);
      });

      if (missingProblems.length > 0) {
        await addUpsolvedProblems(missingProblems);
      }
    },
    [upsolvedProblems, dismissedIds, addUpsolvedProblems]
  );

  // ── Manual refresh: re-fetch solved + sync history ─────────────────
  const onRefreshUpsolvedProblems = useCallback(
    async (history?: Training[]) => {
      refreshSolvedProblems();
      if (history) {
        await syncWithHistory(history);
      }
    },
    [refreshSolvedProblems, syncWithHistory]
  );

  return {
    upsolvedProblems,
    dismissedProblems,
    isLoading: isLoading || isProblemsLoading,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    onRefreshUpsolvedProblems,
    syncWithHistory,
    refreshUpsolvedProblems: mutate,
  };
};

export default useUpsolvedProblems;

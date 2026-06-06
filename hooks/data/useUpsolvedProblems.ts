import {useState, useCallback, useMemo, useEffect} from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "@/hooks/auth/useUser";
import useSolvedProblems from "./useSolvedProblems";
import { useToast } from "@/components/providers/Toast";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

/** Shape of a dismissed-problem record returned by the API */
type DismissedProblemId = { contestId: number; index: string };

const useUpsolvedProblems = () => {
  const {user} = useUser();
  const {toast} = useToast();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useSolvedProblems(user);

  // ── Active upsolve problems ────────────────────────────────────────
  const swrKey = typeof window !== "undefined" && user ? "/api/upsolve" : null;
  const {data, isLoading, error, mutate} = useSWR<TrainingProblem[]>(
    swrKey,
    swrFetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      dedupingInterval: 5000,
    }
  );

  // ── Dismissed (deleted) problem IDs ────────────────────────────────
  const dismissedSwrKey = typeof window !== "undefined" && user ? "/api/upsolve/dismissed" : null;
  const {
    data: dismissedData,
    isLoading: isDismissedLoading,
    mutate: mutateDismissed,
  } = useSWR<DismissedProblemId[]>(
    dismissedSwrKey,
    swrFetcher,
    {
      revalidateOnFocus: false,
      errorRetryCount: 1,
      dedupingInterval: 10000,
    }
  );

  const dismissedIds = useMemo(() => {
    const set = new Set<string>();
    (dismissedData ?? []).forEach((d) => set.add(`${d.contestId}_${d.index}`));
    return set;
  }, [dismissedData]);

  const upsolvedProblems = useMemo(() => data ?? [], [data]);

  const refreshUpsolvedProblems = useCallback(async () => {
    if (upsolvedProblems.length === 0 || solvedProblems.length === 0) {
      return;
    }

    const newlySolved = upsolvedProblems
      .filter((p) => !p.solvedTime)
      .filter((p) =>
        solvedProblems.some(
          (sp) => sp.contestId === p.contestId && sp.index === p.index
        )
      )
      .map((p) => ({...p, solvedTime: Date.now()}));

    if (newlySolved.length === 0) return;

    mutate(
      upsolvedProblems.map(
        (p) =>
          newlySolved.find(
            (ns) => ns.contestId === p.contestId && ns.index === p.index
          ) || p
      ),
      false
    );

    try {
      await apiFetcher("/api/upsolve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newlySolved),
      });
      const count = newlySolved.length;
      toast({
        title: "Upsolve progress",
        description: `Great job! Marked ${count} problem${count > 1 ? "s" : ""} as upsolved.`,
        variant: "success",
      });
      mutate();
    } catch (error) {
      console.error("Failed to update solved status:", error);
      mutate();
    }
  }, [upsolvedProblems, solvedProblems, mutate, toast]);

  useEffect(() => {
    if (solvedProblems?.length > 0) {
      refreshUpsolvedProblems();
    }
  }, [solvedProblems, refreshUpsolvedProblems]);

  const addUpsolvedProblems = useCallback(
    async (problems: TrainingProblem[]) => {
      if (problems.length === 0) return;

      mutate((currentData = []) => [...currentData, ...problems], false);

      try {
        await apiFetcher("/api/upsolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(problems),
        });
        mutate();
      } catch (error) {
        console.error(error);
        mutate();
      }
    },
    [mutate]
  );

  const deleteUpsolvedProblem = useCallback(
    async (problem: TrainingProblem) => {
      mutate(
        (currentData = []) =>
          currentData.filter(
            (p) => p.contestId !== problem.contestId || p.index !== problem.index
          ),
        false
      );

      mutateDismissed(
        (current = []) => [
          ...current,
          { contestId: problem.contestId, index: problem.index },
        ],
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
        mutateDismissed();
      } catch (error) {
        console.error(error);
        mutate();
        mutateDismissed();
      }
    },
    [mutate, mutateDismissed]
  );

  const syncWithHistory = useCallback(async (history: Training[]) => {
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
      console.log(`[UpsolveSync] Found ${missingProblems.length} missing problems in history. Syncing...`);
      await addUpsolvedProblems(missingProblems);
    }
  }, [upsolvedProblems, dismissedIds, addUpsolvedProblems]);

  const onRefreshUpsolvedProblems = useCallback(async (history?: Training[]) => {
    refreshSolvedProblems();
    if (history) {
      await syncWithHistory(history);
    }
  }, [refreshSolvedProblems, syncWithHistory]);

  return {
    upsolvedProblems,
    isLoading: isLoading || isProblemsLoading || isDismissedLoading,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    onRefreshUpsolvedProblems,
    syncWithHistory,
  };
};

export default useUpsolvedProblems;

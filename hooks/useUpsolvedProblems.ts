import {useState, useEffect, useCallback, useMemo} from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "./useUser";
import useSolvedProblems from "./useSolvedProblems";
import { useToast } from "@/components/providers/Toast";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

/** Shape of a dismissed-problem record returned by the API */
type DismissedProblemId = { contestId: number; index: string };

const useUpsolvedProblems = () => {
  const [isClient, setIsClient] = useState(false);
  const {user} = useUser();
  const {toast} = useToast();
  // Use the lightweight hook that only fetches solved problems,
  // avoiding the heavy ~3MB "all problems" fetch.
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useSolvedProblems(user);

  // ── Active upsolve problems ────────────────────────────────────────
  const swrKey = isClient && user ? "/api/upsolve" : null;
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
  // Fetched once on mount so syncWithHistory can skip problems
  // the user previously removed from their upsolve list.
  const dismissedSwrKey = isClient && user ? "/api/upsolve/dismissed" : null;
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

  /**
   * Set of "contestId_index" strings the user has deliberately deleted.
   * Used to prevent syncWithHistory from re-adding them.
   */
  const dismissedIds = useMemo(() => {
    const set = new Set<string>();
    (dismissedData ?? []).forEach((d) => set.add(`${d.contestId}_${d.index}`));
    return set;
  }, [dismissedData]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const upsolvedProblems = useMemo(() => {
    const problems = data ?? [];
    // Keep the original order as they were added to the database
    return problems;
  }, [data]);

  const refreshUpsolvedProblems = useCallback(async () => {
    if (upsolvedProblems.length === 0 || solvedProblems.length === 0) {
      return;
    }

    const newlySolved = upsolvedProblems
      .filter((p) => !p.solvedTime) // only check unsolved problems
      .filter((p) =>
        solvedProblems.some(
          (sp) => sp.contestId === p.contestId && sp.index === p.index
        )
      )
      .map((p) => ({...p, solvedTime: Date.now()}));

    if (newlySolved.length === 0) return;

    // Optimistic UI update
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newlySolved),
      });
      const count = newlySolved.length;
      toast({
        title: "Upsolve progress",
        description: `Great job! Marked ${count} problem${count > 1 ? "s" : ""} as upsolved.`,
        variant: "success",
      });
      // Revalidate to get final state from server
      mutate();
    } catch (error) {
      console.error("Failed to update solved status:", error);
      mutate(); // Rollback on error
    }
  }, [upsolvedProblems, solvedProblems, mutate, toast]);

  useEffect(() => {
    if (solvedProblems?.length > 0) {
      refreshUpsolvedProblems();
    }
  }, [solvedProblems, refreshUpsolvedProblems]);

  const addUpsolvedProblems = useCallback(
    async (problems: TrainingProblem[]) => {
      if (!isClient || problems.length === 0) return;

      // Optimistic update - append new problems at the end in their original order
      mutate((currentData = []) => {
        // Add new problems at the end, maintaining their original order
        return [...currentData, ...problems];
      }, false);

      try {
        await apiFetcher("/api/upsolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(problems),
        });
        // Revalidate to sync with the database
        mutate();
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const deleteUpsolvedProblem = useCallback(
    async (problem: TrainingProblem) => {
      if (!isClient) return;


      // Optimistic update — remove from active list
      mutate(
        (currentData = []) =>
          currentData.filter(
            (p) =>
              p.contestId !== problem.contestId || p.index !== problem.index
          ),
        false
      );

      // Optimistic update — add to dismissed set immediately so
      // any concurrent syncWithHistory call won't re-insert it
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contestId: problem.contestId,
            index: problem.index,
          }),
        });
        // Revalidate dismissed list to ensure it's in sync
        mutateDismissed();
      } catch (error) {
        console.error(error);
        // Rollback both caches on error
        mutate();
        mutateDismissed();
      }
    },
    [isClient, mutate, mutateDismissed]
  );

  const syncWithHistory = useCallback(async (history: Training[]) => {
    if (!isClient || !history || history.length === 0) return;

    const allUnsolved = history.reduce((acc: TrainingProblem[], session) => {
      const unsolvedInSession = session.problems.filter((p) => !p.solvedTime);
      return [...acc, ...unsolvedInSession];
    }, []);

    if (allUnsolved.length === 0) return;

    // Build a set of problems already in the active upsolve queue
    const existingIds = new Set(
      upsolvedProblems.map((p) => `${p.contestId}_${p.index}`)
    );

    // Filter out problems that are:
    //   1. Already in the active upsolve queue
    //   2. Previously dismissed/deleted by the user
    const missingProblems = allUnsolved.filter((p) => {
      const key = `${p.contestId}_${p.index}`;
      return !existingIds.has(key) && !dismissedIds.has(key);
    });

    if (missingProblems.length > 0) {
      console.log(
        `[UpsolveSync] Found ${missingProblems.length} missing problems in history. Syncing...`
      );
      await addUpsolvedProblems(missingProblems);
    }
  }, [isClient, upsolvedProblems, dismissedIds, addUpsolvedProblems]);

  const onRefreshUpsolvedProblems = useCallback(async (history?: Training[]) => {
    refreshSolvedProblems();
    if (history) {
      await syncWithHistory(history);
    }
  }, [refreshSolvedProblems, syncWithHistory]);

  return {
    upsolvedProblems,
    isLoading: isLoading || isProblemsLoading || isDismissedLoading || !isClient,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    onRefreshUpsolvedProblems,
    syncWithHistory,
  };
};

export default useUpsolvedProblems;

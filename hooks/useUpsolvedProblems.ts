import {useState, useEffect, useCallback, useMemo} from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "./useUser";
import useProblems from "./useProblems";
import { useToast } from "@/app/_Components/Toast";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";

const useUpsolvedProblems = () => {
  const [isClient, setIsClient] = useState(false);
  const {user} = useUser();
  const {toast} = useToast();
  const {
    isLoading: isProblemsLoading,
    refreshSolvedProblems,
    solvedProblems,
  } = useProblems(user);

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

      // Optimistic update
      mutate(
        (currentData = []) =>
          currentData.filter(
            (p) =>
              p.contestId !== problem.contestId || p.index !== problem.index
          ),
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
        // No revalidation needed on success
      } catch (error) {
        console.error(error);
        mutate(); // Rollback
      }
    },
    [isClient, mutate]
  );

  const syncWithHistory = useCallback(async (history: Training[]) => {
    if (!isClient || !history || history.length === 0) return;

    const allUnsolved = history.reduce((acc: TrainingProblem[], session) => {
      const unsolvedInSession = session.problems.filter((p) => !p.solvedTime);
      return [...acc, ...unsolvedInSession];
    }, []);

    if (allUnsolved.length === 0) return;

    // Filter out problems already in the upsolve queue to avoid unnecessary requests
    const existingIds = new Set(upsolvedProblems.map(p => `${p.contestId}_${p.index}`));
    const missingProblems = allUnsolved.filter(p => !existingIds.has(`${p.contestId}_${p.index}`));

    if (missingProblems.length > 0) {
      console.log(`[UpsolveSync] Found ${missingProblems.length} missing problems in history. Syncing...`);
      await addUpsolvedProblems(missingProblems);
    }
  }, [isClient, upsolvedProblems, addUpsolvedProblems]);

  const onRefreshUpsolvedProblems = useCallback(async (history?: Training[]) => {
    refreshSolvedProblems();
    if (history) {
      await syncWithHistory(history);
    }
  }, [refreshSolvedProblems, syncWithHistory]);

  return {
    upsolvedProblems,
    isLoading: isLoading || isProblemsLoading || !isClient,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    onRefreshUpsolvedProblems,
    syncWithHistory,
  };
};

export default useUpsolvedProblems;





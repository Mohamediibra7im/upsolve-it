import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "@/hooks/auth/useUser";
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
  // The list only changes once the server has stored them: showing rows the
  // server may refuse made the queue flash problems that then vanished.
  const addUpsolvedProblems = useCallback(
    async (problems: TrainingProblem[]) => {
      // One entry per problem, and only the fields the API accepts.
      const body = [
        ...new Map(
          problems.map((p) => [
            `${p.contestId}_${p.index}`,
            {
              contestId: p.contestId,
              index: p.index,
              name: p.name,
              rating: p.rating ?? 0,
              tags: p.tags ?? [],
              url: p.url,
              solvedTime: null,
            },
          ]),
        ).values(),
      ];
      if (body.length === 0) return;

      try {
        await apiFetcher("/api/upsolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (error) {
        console.error("Failed to add problems to the upsolve queue:", error);
      }
      await mutate();
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
      // Until the queue has loaded, every problem would look missing from it.
      if (!data || !history || history.length === 0) return;

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
    [data, upsolvedProblems, dismissedIds, addUpsolvedProblems]
  );

  // ── Import failed contest problems + refresh solved status from Codeforces ──
  const syncWithCodeforces = useCallback(async () => {
    const result = await apiFetcher<{ added: number; solved: number }>(
      "/api/upsolve/sync",
      { method: "POST" }
    );
    await mutate();
    return result;
  }, [mutate]);

  return {
    upsolvedProblems,
    dismissedProblems,
    isLoading,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    syncWithCodeforces,
    syncWithHistory,
    refreshUpsolvedProblems: mutate,
  };
};

export default useUpsolvedProblems;

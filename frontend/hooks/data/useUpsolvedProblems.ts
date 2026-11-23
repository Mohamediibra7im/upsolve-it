import { useCallback, useMemo } from "react";
import useSWR, { mutate as mutateGlobal } from "swr";
import { TrainingProblem } from "@/types/TrainingProblem";
import { Training } from "@/types/Training";
import useUser from "@/hooks/auth/useUser";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";
import {
  judgeOf,
  problemId,
  problemRef,
  type Judge,
  type UpsolveProblem,
} from "@/types/UpsolveProblem";

/** Shape of a dismissed-problem record returned by the API */
type DismissedProblemId = {
  judge?: Judge;
  contestId: number | string;
  index: string;
};

/** Combined response shape from GET /api/upsolve */
interface UpsolveResponse {
  items: UpsolveProblem[];
  dismissed: DismissedProblemId[];
}

/** What POST /api/upsolve/sync answers. */
export type UpsolveSyncResult = {
  added: number;
  solved: number;
  resolved: number;
  /** AtCoder could not be reached; the Codeforces part still ran. */
  atcoderSkipped: boolean;
};

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

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
    },
  );

  const upsolvedProblems = useMemo(() => data?.items ?? [], [data]);

  const dismissedProblems = useMemo(
    () => data?.dismissed ?? [],
    [data?.dismissed],
  );

  const dismissedIds = useMemo(() => {
    const set = new Set<string>();
    // Sessions only hold Codeforces problems, so only those are compared.
    (data?.dismissed ?? [])
      .filter((d) => judgeOf(d) === "codeforces")
      .forEach((d) => set.add(`${d.contestId}_${d.index}`));
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
    [mutate],
  );

  // ── Dismiss (delete) a problem from upsolve queue ──────────────────
  const deleteUpsolvedProblem = useCallback(
    async (problem: UpsolveProblem) => {
      mutate(
        (currentData) => ({
          items: (currentData?.items ?? []).filter(
            (p) => problemId(p) !== problemId(problem),
          ),
          dismissed: [...(currentData?.dismissed ?? []), problemRef(problem)],
        }),
        false,
      );

      try {
        await apiFetcher("/api/upsolve", json("DELETE", problemRef(problem)));
        mutate();
      } catch (error) {
        console.error("Failed to dismiss problem:", error);
        mutate();
      }
    },
    [mutate],
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
        upsolvedProblems
          .filter((p) => judgeOf(p) === "codeforces")
          .map((p) => `${p.contestId}_${p.index}`),
      );

      const missingProblems = allUnsolved.filter((p) => {
        const key = `${p.contestId}_${p.index}`;
        return !existingIds.has(key) && !dismissedIds.has(key);
      });

      if (missingProblems.length > 0) {
        await addUpsolvedProblems(missingProblems);
      }
    },
    [data, upsolvedProblems, dismissedIds, addUpsolvedProblems],
  );

  // ── Import failed contest problems + refresh solved status from Codeforces ──
  const syncWithCodeforces = useCallback(async () => {
    const result = await apiFetcher<UpsolveSyncResult>("/api/upsolve/sync", {
      method: "POST",
    });
    await mutate();
    // a newly solved problem moves the upsolve streak the dashboard shows
    if (result.solved > 0) void mutateGlobal("/api/users/me/streaks");
    return result;
  }, [mutate]);

  // ── Add the problem a pasted link points to ────────────────────────
  // Throws with the server's own message (not a problem link, already queued…).
  const addByUrl = useCallback(
    async (url: string) => {
      const { problem } = await apiFetcher<{ problem: UpsolveProblem }>(
        "/api/upsolve/by-url",
        json("POST", { url }),
      );
      await mutate();
      return problem;
    },
    [mutate],
  );

  // ── Save (or clear, with "") the note on a problem ─────────────────
  const saveNote = useCallback(
    async (problem: UpsolveProblem, note: string) => {
      await apiFetcher(
        "/api/upsolve/note",
        json("PUT", { ...problemRef(problem), note }),
      );
      // The server stored exactly this, so the list is updated without a refetch.
      mutate(
        (current) =>
          current && {
            ...current,
            items: current.items.map((p) =>
              problemId(p) === problemId(problem)
                ? { ...p, note: note.trim() }
                : p,
            ),
          },
        false,
      );
    },
    [mutate],
  );

  // ── Give up on a due re-solve: the problem stops coming back ───────
  const skipResolve = useCallback(
    async (problem: UpsolveProblem) => {
      await apiFetcher(
        "/api/upsolve/resolve/skip",
        json("POST", problemRef(problem)),
      );
      await mutate();
    },
    [mutate],
  );

  return {
    upsolvedProblems,
    dismissedProblems,
    isLoading,
    error,
    deleteUpsolvedProblem,
    addUpsolvedProblems,
    addByUrl,
    saveNote,
    skipResolve,
    syncWithCodeforces,
    syncWithHistory,
    refreshUpsolvedProblems: mutate,
  };
};

export default useUpsolvedProblems;

import { useState, useCallback } from "react";
import useSWR from "swr";
import { CodeforcesProblem } from "@/types/Codeforces";
import getSolvedProblems from "@/services/codeforces/getSolvedProblems";
import { User } from "@/types/User";

const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`;

/**
 * Lightweight hook that only fetches the user's solved problems from CF.
 *
 * Extracted from useProblems so that consumers (e.g., the upsolve hook,
 * the home page dashboard) don't accidentally trigger the heavy ~3 MB
 * "all problems" fetch that is only needed by the training generator.
 */
const useSolvedProblems = (user: User | null | undefined) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: solvedProblems,
    isLoading,
    mutate,
  } = useSWR<CodeforcesProblem[]>(
    user ? SOLVED_PROBLEMS_CACHE_KEY(user.codeforcesHandle) : null,
    async () => {
      if (!user) throw new Error("No user");
      const res = await getSolvedProblems(user);
      if (!res.success) throw new Error("Failed to fetch solved problems");
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300_000,
    },
  );

  const refreshSolvedProblems = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      const updatedData = await mutate(
        async () => {
          const res = await getSolvedProblems(user);
          if (!res.success) throw new Error("Failed to fetch solved problems");
          return res.data;
        },
        { revalidate: true },
      );
      return updatedData;
    } finally {
      setIsRefreshing(false);
    }
  }, [user, mutate]);

  return {
    solvedProblems: solvedProblems ?? [],
    isLoading: isLoading || isRefreshing,
    refreshSolvedProblems,
  };
};

export default useSolvedProblems;

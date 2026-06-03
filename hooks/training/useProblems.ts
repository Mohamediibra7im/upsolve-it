import { useState, useCallback } from "react";
import useSWR from "swr";
import { CodeforcesProblem, ProblemTag } from "@/types/Codeforces";
import { TrainingProblem } from "@/types/TrainingProblem";
import getAllProblems from "@/services/codeforces/getAllProblems";
import getSolvedProblems from "@/services/codeforces/getSolvedProblems";
import { User } from "@/types/User";
import { expectedTimeSecondsFromRating } from "@/services/training/expectedTime";

const PROBLEMS_CACHE_KEY = "codeforces-all-problems";
const SOLVED_PROBLEMS_CACHE_KEY = (handle: string) =>
  `codeforces-solved-${handle}`;

// Helper to check if a problem contains any selected tags
const hasAnyTag = (problem: CodeforcesProblem, tags: ProblemTag[]) => {
  if (tags.length === 0) return true;
  return tags.some((tag) => problem.tags.includes(tag.value));
};

/** Problems whose CF rating is nearest to `target` if an exact match is sparse. */
function poolByRatingProximity(
  source: CodeforcesProblem[],
  target: number,
): CodeforcesProblem[] {
  const rated = source.filter(
    (p) => typeof p.rating === "number" && !Number.isNaN(p.rating),
  );
  for (const tol of [0, 100, 200, 400]) {
    const subset = rated.filter(
      (p) => Math.abs((p.rating) - target) <= tol,
    );
    if (subset.length > 0) return subset;
  }
  return [];
}

// Helper to choose a random problem from a pool, avoiding duplicates
const chooseFrom = (problist: CodeforcesProblem[], alreadyChosen: Set<string>) => {
  if (problist.length === 0) return null;
  let attempts = 0;
  let tmp: CodeforcesProblem;
  let str: string;

  do {
    tmp = problist[Math.floor(Math.random() * problist.length)];
    str = `${tmp.contestId}_${tmp.index}`;
    attempts++;
  } while (alreadyChosen.has(str) && attempts < 100);

  alreadyChosen.add(str);
  return tmp;
};

const useProblems = (user: User | null | undefined) => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all problems
  const { data: allProblems, isLoading: isLoadingAll } = useSWR<
    CodeforcesProblem[]
  >(
    PROBLEMS_CACHE_KEY,
    async () => {
      const res = await getAllProblems();
      if (!res.success) {
        throw new Error("Failed to fetch problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // The CF problem list changes infrequently; cache for 6 hours
      // so navigation between pages is instant.
      dedupingInterval: 6 * 3_600_000,
      // Keep stale data visible while a background revalidation runs,
      // preventing the loading spinner from re-appearing.
      keepPreviousData: true,
    },
  );

  // Fetch solved problems only if we have a user
  const {
    data: solvedProblems,
    isLoading: isLoadingSolved,
    mutate: mutateSolved,
  } = useSWR<CodeforcesProblem[]>(
    user ? SOLVED_PROBLEMS_CACHE_KEY(user.codeforcesHandle) : null,
    async () => {
      if (!user) {
        throw new Error("No user");
      }
      const res = await getSolvedProblems(user);
      if (!res.success) {
        throw new Error("Failed to fetch solved problems");
      }
      return res.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    },
  );

  const refreshSolvedProblems = useCallback(async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      // Await the mutation and capture the updated data
      const updatedData = await mutateSolved(
        async () => {
          const res = await getSolvedProblems(user);
          if (!res.success) {
            throw new Error("Failed to fetch solved problems");
          }
          return res.data;
        },
        { revalidate: true },
      );

      setIsLoading(false);
      // Return the updated data so caller can use it immediately
      return updatedData;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [user, mutateSolved]);

  const getRandomProblemsFromRatings = useCallback(
    (
      ratings: number[],
      tags: ProblemTag[],
      lb: number | null,
      ub: number | null,
    ) => {
      if (!user || allProblems === undefined || solvedProblems === undefined) {
        return;
      }

      setIsLoading(true);

      // Convert null bounds to defaults
      const lower = lb ?? 0;
      const upper = ub ?? Infinity;

      const solvedProblemIds = new Set(
        solvedProblems.map((p) => `${p.contestId}_${p.index}`),
      );

      const unsolvedProblems = allProblems.filter(
        (problem) =>
          !solvedProblemIds.has(`${problem.contestId}_${problem.index}`),
      );

      const problemPools = ratings.map((rating) => ({
        rating,
        solved: poolByRatingProximity(solvedProblems, rating),
        unsolved: poolByRatingProximity(unsolvedProblems, rating),
      }));

      const alreadyChosen = new Set<string>();
      const newProblems: (TrainingProblem | null)[] = problemPools.map((pool) => {
        let problem = null;

        let newPool = pool;
        if (tags.length > 0) {
          newPool = {
            ...pool,
            solved: pool.solved.filter((p) => hasAnyTag(p, tags)),
            unsolved: pool.unsolved.filter((p) => hasAnyTag(p, tags)),
          };
        }

        const newPool2 = {
          rating: newPool.rating,
          solved: {
            inrange: newPool.solved.filter((p) => p.contestId >= lower && p.contestId <= upper),
            outsiderange: newPool.solved.filter((p) => p.contestId < lower || p.contestId > upper),
          },
          unsolved: {
            inrange: newPool.unsolved.filter((p) => p.contestId >= lower && p.contestId <= upper),
            outsiderange: newPool.unsolved.filter((p) => p.contestId < lower || p.contestId > upper),
          },
        };

        if (newPool.unsolved.length > 0) {
          problem = newPool2.unsolved.inrange.length > 0 
            ? chooseFrom(newPool2.unsolved.inrange, alreadyChosen)
            : chooseFrom(newPool2.unsolved.outsiderange, alreadyChosen);
        } else {
          problem = newPool2.solved.inrange.length > 0
            ? chooseFrom(newPool2.solved.inrange, alreadyChosen)
            : chooseFrom(newPool2.solved.outsiderange, alreadyChosen);
        }

        if (!problem) return null;

        const pid = `${problem.contestId}_${problem.index}`;
        return {
          ...problem,
          url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
          solvedTime: null,
          problemId: pid,
          expectedTimeSeconds: expectedTimeSecondsFromRating(problem.rating ?? 0),
        };
      });

      setIsLoading(false);
      return newProblems.filter((p): p is TrainingProblem => p !== null);
    },
    [user, allProblems, solvedProblems],
  );

  const getRandomProblems = useCallback(
    (
      tags: ProblemTag[],
      lb: number | null,
      ub: number | null,
      customRatings: { P1: number; P2: number; P3: number; P4: number },
    ) => {
      return getRandomProblemsFromRatings(
        [
          customRatings.P1,
          customRatings.P2,
          customRatings.P3,
          customRatings.P4,
        ],
        tags,
        lb,
        ub,
      );
    },
    [getRandomProblemsFromRatings],
  );

  return {
    allProblems: allProblems ?? [],
    solvedProblems: solvedProblems ?? [],
    isLoading: isLoading || isLoadingAll || isLoadingSolved,
    refreshSolvedProblems,
    getRandomProblems,
    getRandomProblemsFromRatings,
  };
};

export default useProblems;





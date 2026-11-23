import { useMemo } from "react";
import useSWR from "swr";
import { useUser } from "@/hooks/auth";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { swrFetcher } from "@/lib/apiClient";
import { trainingAchievements } from "./Achievements";
import {
  isTrainingProblemCountedSolved,
  trainingSessionHasSolve,
} from "@/services/training/problemCountedSolved";

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

/** What the profile pages show about the signed-in user. SWR shares the
 *  requests, so each page can call this without fetching twice. */
export function useProfileData() {
  const { user } = useUser();
  const {
    history,
    error: historyError,
    refresh: refreshHistory,
  } = useHistory();
  const { upsolvedProblems } = useUpsolvedProblems();
  const { data: streaks } = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  const training = useMemo(() => {
    const problems = history.flatMap((s) => s.problems);
    const solved = problems.filter(isTrainingProblemCountedSolved).length;
    const performances = history
      .filter(trainingSessionHasSolve)
      .map((s) => s.performance ?? 0);
    return {
      sessions: history.length,
      problems: problems.length,
      solved,
      solveRate: problems.length
        ? Math.round((solved / problems.length) * 100)
        : 0,
      avgPerformance: performances.length
        ? Math.round(
            performances.reduce((a, b) => a + b, 0) / performances.length,
          )
        : null,
      bestPerformance: performances.length ? Math.max(...performances) : null,
    };
  }, [history]);

  const upsolved = upsolvedProblems.filter((p) => p.solvedTime != null).length;
  const achievements = [
    ...trainingAchievements({
      sessions: training.sessions,
      solveRate: training.solveRate,
      upsolved,
      avgPerformance: training.avgPerformance ?? 0,
    }),
    {
      name: "Rating milestone",
      desc: "Reach a Codeforces rating of 1900.",
      value: user?.rating || 0,
      target: 1900,
    },
    {
      name: "Steady progress",
      desc: "Reach 80% consistency.",
      value: streaks?.consistencyScore ?? 0,
      target: 80,
      unit: "%",
    },
  ];

  return {
    user,
    rating: user?.rating || 0,
    history,
    historyError,
    refreshHistory,
    upsolvedProblems,
    upsolved,
    achievements,
    streaks,
    training,
  };
}

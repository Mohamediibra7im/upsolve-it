import type { TrainingProblem } from "@/types/TrainingProblem";

/**
 * The judge's own submit page with this problem already chosen. The code
 * cannot be put there from here: a browser lets no site write into another
 * site's page. It goes onto the clipboard instead, one paste away.
 */
export function submitUrl(
  problem: Pick<TrainingProblem, "judge" | "contestId" | "index" | "url">,
) {
  if (problem.judge === "atcoder") {
    // an AtCoder task is named in its own address: …/tasks/abc300_e
    const task = problem.url.slice(problem.url.lastIndexOf("/") + 1);
    return `https://atcoder.jp/contests/${problem.contestId}/submit?taskScreenName=${encodeURIComponent(task)}`;
  }
  return `https://codeforces.com/problemset/submit/${problem.contestId}/${problem.index}`;
}

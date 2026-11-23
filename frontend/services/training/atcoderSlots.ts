import type { TrainingProblem } from "@/types/TrainingProblem";
import { expectedTimeSecondsFromRating } from "@/services/training/expectedTime";

/** An AtCoder task as GET /api/atcoder/problems lists it. */
export type AtcoderProblem = {
  contestId: string;
  index: string;
  name: string;
  /** Its difficulty as a rating on the Codeforces scale: an estimate. */
  rating: number;
  /** The difficulty AtCoder Problems gives it, on AtCoder's own scale. */
  difficulty: number;
  url: string;
};

export const atcoderKey = (p: { contestId: number | string; index: string }) =>
  `${p.contestId}_${p.index}`;

/**
 * Gives up to `count` slots of a set to AtCoder problems. Which slots is left
 * to chance; each takes an unsolved AtCoder problem rated as near to the slot
 * as can be found within 400 points. A slot with nothing that near keeps the
 * problem it had, so a set never comes back shorter than it went in.
 */
export function withAtcoderProblems(
  set: (TrainingProblem | null)[],
  ratings: number[],
  pool: AtcoderProblem[],
  solved: Set<string>,
  count: number,
  random: () => number = Math.random,
): (TrainingProblem | null)[] {
  const result = [...set];
  const unsolved = pool.filter((p) => !solved.has(atcoderKey(p)));
  const taken = new Set<string>();
  // a shuffled order of the slots; the first `count` that find a problem win
  const slots = ratings
    .map((_, i) => ({ i, at: random() }))
    .sort((a, b) => a.at - b.at)
    .map(({ i }) => i);

  let given = 0;
  for (const i of slots) {
    if (given >= count) break;
    let near: AtcoderProblem[] = [];
    for (const tolerance of [0, 100, 200, 400]) {
      near = unsolved.filter(
        (p) =>
          Math.abs(p.rating - ratings[i]) <= tolerance &&
          !taken.has(atcoderKey(p)),
      );
      if (near.length > 0) break;
    }
    if (near.length === 0) continue;
    const problem = near[Math.floor(random() * near.length)];
    taken.add(atcoderKey(problem));
    given++;
    result[i] = {
      judge: "atcoder",
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      type: "PROGRAMMING",
      // two Codeforces fields nothing reads for a session problem
      problemsetName: "",
      points: 0,
      rating: problem.rating,
      tags: [],
      url: problem.url,
      solvedTime: null,
      problemId: atcoderKey(problem),
      expectedTimeSeconds: expectedTimeSecondsFromRating(problem.rating),
    };
  }
  return result;
}

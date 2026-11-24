export const JUDGES = ["codeforces", "atcoder"] as const;
export type Judge = (typeof JUDGES)[number];

export const JUDGE_NAMES: Record<Judge, string> = {
  codeforces: "Codeforces",
  atcoder: "AtCoder",
};

/** One round of GET /api/contests/upcoming. */
export interface UpcomingContest {
  judge: Judge;
  id: string;
  name: string;
  /** ISO 8601, UTC */
  startsAt: string;
  durationMinutes: number;
  url: string;
}

/** GET /api/contests/upcoming: soonest first, and the judges that could not be read. */
export interface ContestSchedule {
  contests: UpcomingContest[];
  unavailable: Judge[];
}

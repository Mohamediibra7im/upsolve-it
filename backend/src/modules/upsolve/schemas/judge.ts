/** The online judges a problem can come from. Records without one are Codeforces. */
export const JUDGES = ['codeforces', 'atcoder'] as const;
export type Judge = (typeof JUDGES)[number];

/** A Codeforces contest number, or another judge's contest name ("abc300"). */
export type ContestId = number | string;

/** What identifies a problem on a user's list. */
export type ProblemRef = { judge?: Judge; contestId: ContestId; index: string };

/** The stored identity of a problem: the judge is always set, Codeforces ids are numbers. */
export function problemKey(p: ProblemRef) {
  const judge: Judge = p.judge ?? 'codeforces';
  return {
    judge,
    contestId: judge === 'codeforces' ? Number(p.contestId) : p.contestId,
    index: p.index,
  };
}

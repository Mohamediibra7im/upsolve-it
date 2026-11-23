/** One place for Codeforces ranks: thresholds, names and the design-system
 *  colour key (`data-rank`, see .u-rank in globals.css). */
export const RANKS = [
  { key: "newbie", name: "Newbie", min: 0 },
  { key: "pupil", name: "Pupil", min: 1200 },
  { key: "specialist", name: "Specialist", min: 1400 },
  { key: "expert", name: "Expert", min: 1600 },
  { key: "cm", name: "Candidate Master", min: 1900 },
  { key: "master", name: "Master", min: 2100 },
  { key: "master", name: "International Master", min: 2300 },
  { key: "gm", name: "Grandmaster", min: 2400 },
  { key: "gm", name: "International Grandmaster", min: 2600 },
  { key: "gm", name: "Legendary Grandmaster", min: 3000 },
] as const;

export type RankKey = (typeof RANKS)[number]["key"];

const rankAt = (rating: number) =>
  [...RANKS].reverse().find((r) => rating >= r.min) ?? RANKS[0];

/** "Pupil" for 1342; "Unrated" for 0 or a missing rating. */
export const rankName = (rating?: number | null): string =>
  rating ? rankAt(rating).name : "Unrated";

/** Colour key for a rating; undefined when unrated (falls back to ink). */
export const rankKey = (rating?: number | null): RankKey | undefined =>
  rating ? rankAt(rating).key : undefined;

/** The next rank above a rating, or null at the top. */
export const nextRank = (rating: number) =>
  RANKS.find((r) => r.min > rating) ?? null;

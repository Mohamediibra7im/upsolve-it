import type { UpsolveProblem } from "@/types/UpsolveProblem";
import { contestOf, type Round } from "./rounds";

export const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "easiest", label: "Easiest" },
  { key: "hardest", label: "Hardest" },
] as const;
export type QueueSort = (typeof SORTS)[number]["key"];

/** How the queue is narrowed and ordered. Empty values mean "no limit". */
export type QueueFilters = {
  sort: QueueSort;
  /** A problem must carry every one of these. */
  tags: string[];
  min: number | null;
  max: number | null;
  /** A contest key from `contestOf`, or "" for any contest. */
  contest: string;
};

export const NO_FILTERS: QueueFilters = {
  sort: "newest",
  tags: [],
  min: null,
  max: null,
  contest: "",
};

/** The filters that hide something: the sort order is not one of them. */
export const activeFilterCount = (f: QueueFilters) =>
  f.tags.length +
  (f.min !== null || f.max !== null ? 1 : 0) +
  (f.contest ? 1 : 0);

/** A problem without a rating matches no rating range. */
export function filterProblems(problems: UpsolveProblem[], f: QueueFilters) {
  return problems.filter((p) => {
    if (f.contest && contestOf(p).key !== f.contest) return false;
    if (f.tags.some((tag) => !(p.tags ?? []).includes(tag))) return false;
    if (f.min === null && f.max === null) return true;
    const rating = p.rating || 0;
    return (
      rating > 0 &&
      (f.min === null || rating >= f.min) &&
      (f.max === null || rating <= f.max)
    );
  });
}

/**
 * Rounds in the chosen order. By rating, a round stands where its easiest
 * (or hardest) waiting problem puts it; rounds with no rated problem go last.
 */
export function sortRounds(rounds: Round[], sort: QueueSort) {
  const ratings = (r: Round) => {
    const open = r.problems
      .filter(({ problem }) => !problem.solvedTime)
      .map(({ problem }) => problem.rating || 0)
      .filter((rating) => rating > 0);
    return open.length ? open : null;
  };
  const by: Record<QueueSort, (a: Round, b: Round) => number> = {
    newest: (a, b) => b.when - a.when,
    oldest: (a, b) => a.when - b.when,
    easiest: (a, b) =>
      Math.min(...(ratings(a) ?? [Infinity])) -
      Math.min(...(ratings(b) ?? [Infinity])),
    hardest: (a, b) =>
      Math.max(...(ratings(b) ?? [-Infinity])) -
      Math.max(...(ratings(a) ?? [-Infinity])),
  };
  return [...rounds].sort(by[sort]);
}

const toRating = (value: string | null) => {
  const n = Number(value);
  return value && Number.isInteger(n) && n >= 0 && n <= 5000 ? n : null;
};

/** Reads the filters back from a page address ("?sort=oldest&tag=dp&min=1200"). */
export function parseFilters(search: string): QueueFilters {
  const q = new URLSearchParams(search);
  const sort = q.get("sort");
  return {
    sort: SORTS.some((s) => s.key === sort) ? (sort as QueueSort) : "newest",
    tags: q.getAll("tag").filter(Boolean).slice(0, 10),
    min: toRating(q.get("min")),
    max: toRating(q.get("max")),
    contest: q.get("contest") ?? "",
  };
}

/** The filters as a query string, without anything left at its default. */
export function filtersToSearch(f: QueueFilters) {
  const q = new URLSearchParams();
  if (f.sort !== "newest") q.set("sort", f.sort);
  f.tags.forEach((tag) => q.append("tag", tag));
  if (f.min !== null) q.set("min", String(f.min));
  if (f.max !== null) q.set("max", String(f.max));
  if (f.contest) q.set("contest", f.contest);
  const text = q.toString();
  return text ? `?${text}` : "";
}

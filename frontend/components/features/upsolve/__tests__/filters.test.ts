import {
  NO_FILTERS,
  activeFilterCount,
  filterProblems,
  filtersToSearch,
  parseFilters,
  sortRounds,
} from "../filters";
import { buildRounds } from "../rounds";

const problem = (contestId: number | string, index: string, extra = {}) =>
  ({
    contestId,
    index,
    name: `${contestId}${index}`,
    rating: 1200,
    tags: [],
    url: "",
    solvedTime: null,
    ...extra,
  }) as any;

const queue = [
  problem(10, "A", {
    rating: 1300,
    tags: ["dp", "greedy"],
    createdAt: "2026-01-01T00:00:00Z",
  }),
  problem(10, "B", {
    rating: 1900,
    tags: ["dp"],
    createdAt: "2026-01-01T00:00:00Z",
  }),
  problem(20, "C", {
    rating: 800,
    tags: ["math"],
    createdAt: "2026-02-01T00:00:00Z",
  }),
  problem(30, "D", {
    rating: 0,
    tags: ["dp"],
    createdAt: "2026-03-01T00:00:00Z",
  }),
  problem("abc300", "E", {
    judge: "atcoder",
    rating: 0,
    createdAt: "2026-04-01T00:00:00Z",
  }),
];
const names = (list: any[]) => list.map((p) => p.name);

describe("filterProblems", () => {
  it("returns everything without filters", () => {
    expect(filterProblems(queue, NO_FILTERS)).toHaveLength(5);
  });

  it("needs every chosen tag", () => {
    expect(
      names(filterProblems(queue, { ...NO_FILTERS, tags: ["dp"] })),
    ).toEqual(["10A", "10B", "30D"]);
    expect(
      names(filterProblems(queue, { ...NO_FILTERS, tags: ["dp", "greedy"] })),
    ).toEqual(["10A"]);
  });

  it("keeps a rating range to rated problems inside it", () => {
    expect(names(filterProblems(queue, { ...NO_FILTERS, min: 1000 }))).toEqual([
      "10A",
      "10B",
    ]);
    expect(names(filterProblems(queue, { ...NO_FILTERS, max: 1300 }))).toEqual([
      "10A",
      "20C",
    ]);
    expect(
      names(filterProblems(queue, { ...NO_FILTERS, min: 1300, max: 1300 })),
    ).toEqual(["10A"]);
  });

  it("keeps to one contest, on either judge, and combines with the rest", () => {
    expect(
      names(filterProblems(queue, { ...NO_FILTERS, contest: "codeforces:10" })),
    ).toEqual(["10A", "10B"]);
    expect(
      names(
        filterProblems(queue, { ...NO_FILTERS, contest: "atcoder:abc300" }),
      ),
    ).toEqual(["abc300E"]);
    expect(
      names(
        filterProblems(queue, {
          ...NO_FILTERS,
          contest: "codeforces:10",
          tags: ["dp"],
          min: 1500,
        }),
      ),
    ).toEqual(["10B"]);
  });
});

describe("sortRounds", () => {
  const rounds = buildRounds(queue, []);
  const order = (sort: any) => sortRounds(rounds, sort).map((r) => r.title);

  it("orders rounds by age or by their easiest and hardest waiting problem", () => {
    expect(order("newest")).toEqual([
      "AtCoder ABC300",
      "Contest 30",
      "Contest 20",
      "Contest 10",
    ]);
    expect(order("oldest")).toEqual([
      "Contest 10",
      "Contest 20",
      "Contest 30",
      "AtCoder ABC300",
    ]);
    // unrated rounds go last either way
    expect(order("easiest").slice(0, 2)).toEqual(["Contest 20", "Contest 10"]);
    expect(order("hardest").slice(0, 2)).toEqual(["Contest 10", "Contest 20"]);
  });
});

describe("filters in the page address", () => {
  it("survive a round trip and leave defaults out", () => {
    expect(filtersToSearch(NO_FILTERS)).toBe("");
    const filters = {
      sort: "oldest",
      tags: ["dp", "two pointers"],
      min: 1200,
      max: null,
      contest: "codeforces:10",
    } as const;
    const search = filtersToSearch({ ...filters, tags: [...filters.tags] });
    expect(search).toBe(
      "?sort=oldest&tag=dp&tag=two+pointers&min=1200&contest=codeforces%3A10",
    );
    expect(parseFilters(search)).toEqual({
      ...filters,
      tags: [...filters.tags],
    });
  });

  it("ignore values that make no sense", () => {
    expect(parseFilters("?sort=sideways&min=abc&max=-5")).toEqual(NO_FILTERS);
  });

  it("count what hides problems, not the sort order", () => {
    expect(activeFilterCount({ ...NO_FILTERS, sort: "oldest" })).toBe(0);
    expect(
      activeFilterCount({
        ...NO_FILTERS,
        tags: ["dp", "math"],
        min: 1200,
        max: 1600,
        contest: "codeforces:10",
      }),
    ).toBe(4);
  });
});

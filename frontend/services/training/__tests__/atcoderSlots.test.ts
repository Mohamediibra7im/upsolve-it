import { withAtcoderProblems, type AtcoderProblem } from "../atcoderSlots";

const cf = (contestId: number) =>
  ({
    contestId,
    index: "A",
    name: `CF ${contestId}`,
    rating: 1200,
    tags: ["dp"],
    url: "",
    solvedTime: null,
  }) as any;
const ac = (contestId: string, rating: number): AtcoderProblem => ({
  contestId,
  index: "C",
  name: `AC ${contestId}`,
  rating,
  difficulty: rating - 300,
  url: `https://atcoder.jp/contests/${contestId}/tasks/${contestId}_c`,
});
/** A "random" that always picks the first: slots are taken in order. */
const first = () => 0;
const judges = (set: any[]) => set.map((p) => p?.judge ?? "codeforces");

const ratings = [1200, 1400, 1600, 1800];
const set = [cf(1), cf(2), cf(3), cf(4)];
const pool = [ac("abc301", 1200), ac("abc302", 1400), ac("abc303", 1600)];

describe("withAtcoderProblems", () => {
  it("leaves the set alone for a count of zero", () => {
    expect(withAtcoderProblems(set, ratings, pool, new Set(), 0)).toEqual(set);
  });

  it("gives the asked number of slots to AtCoder problems at the slot's rating", () => {
    const result = withAtcoderProblems(set, ratings, pool, new Set(), 2, first);
    expect(judges(result)).toEqual([
      "atcoder",
      "atcoder",
      "codeforces",
      "codeforces",
    ]);
    expect(result[1]).toMatchObject({
      judge: "atcoder",
      contestId: "abc302",
      index: "C",
      rating: 1400,
      tags: [],
      problemId: "abc302_C",
      url: "https://atcoder.jp/contests/abc302/tasks/abc302_c",
      solvedTime: null,
    });
  });

  it("skips solved problems and never uses one problem twice", () => {
    const twins = [ac("abc301", 1200), ac("abc309", 1200)];
    const result = withAtcoderProblems(
      set,
      [1200, 1200, 1200, 1200],
      twins,
      new Set(["abc301_C"]),
      4,
      first,
    );
    expect(
      result.filter((p) => p?.judge === "atcoder").map((p) => p!.contestId),
    ).toEqual(["abc309"]);
  });

  it("keeps the Codeforces problem where AtCoder has nothing within 400 points", () => {
    const result = withAtcoderProblems(
      set,
      [1200, 3000],
      pool,
      new Set(),
      2,
      first,
    );
    expect(judges(result).slice(0, 2)).toEqual(["atcoder", "codeforces"]);
    // the nearest one within reach is taken when there is no exact match
    expect(
      withAtcoderProblems([cf(1)], [1900], pool, new Set(), 1, first)[0],
    ).toMatchObject({ contestId: "abc303", rating: 1600 });
  });

  it("fills a slot Codeforces left empty", () => {
    expect(
      withAtcoderProblems([null], [1200], pool, new Set(), 1, first)[0],
    ).toMatchObject({ judge: "atcoder", contestId: "abc301" });
  });
});

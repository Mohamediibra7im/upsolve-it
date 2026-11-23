import { buildRounds } from "../rounds";

const problem = (contestId: number, index: string, extra = {}) =>
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

const session = (startTime: number, problems: any[], extra = {}) =>
  ({ _id: `s${startTime}`, startTime, problems, ...extra }) as any;

describe("buildRounds", () => {
  it("puts session problems under their latest session and the rest under their contest", () => {
    const queue = [
      problem(10, "B"),
      problem(10, "C", { solvedTime: 5 }),
      problem(20, "A", { createdAt: "2026-01-02T00:00:00Z" }),
      problem(20, "D", { createdAt: "2026-01-01T00:00:00Z", solvedTime: 9 }),
    ];
    const history = [
      // an older session that also held 10B: the newer one wins
      session(1_700_000_000_000, [problem(10, "B")]),
      session(
        1_800_000_000_000,
        [
          problem(1, "A", { solvedTime: 3 }),
          problem(10, "B"),
          problem(10, "C"),
          problem(2, "A"),
        ],
        { trainingMode: "speed" },
      ),
    ];

    const rounds = buildRounds(queue, history);

    expect(rounds.map((r) => r.title)).toEqual(["Speed session", "Contest 20"]);
    expect(rounds[0].slots).toEqual([
      { label: "A", state: "solved" }, // solved in the session itself
      { label: "B", state: "open" },
      { label: "C", state: "solved" }, // solved later, from the queue
      { label: "D", state: "none" }, // missed, but removed from the queue
    ]);
    expect(rounds[0].problems.map((p) => p.slot)).toEqual(["B", "C"]);
    expect(rounds[0].waiting).toBe(1);
    expect(rounds[1]).toMatchObject({ kind: "contest", waiting: 1 });
    expect(rounds[1].when).toBe(Date.parse("2026-01-02T00:00:00Z"));
  });
});

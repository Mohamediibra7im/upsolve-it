import { sessionLine } from "../sessionLine";

const p = (solved: boolean, speedStatus = solved ? "normal" : "unsolved") =>
  ({ solved, speedStatus }) as Parameters<typeof sessionLine>[0][number];

describe("sessionLine", () => {
  it("says how many were solved, at what pace, and what is left", () => {
    expect(
      sessionLine([p(true, "fast"), p(false), p(true, "fast"), p(false)]),
    ).toBe("Two solved, both ahead of pace. Two left to upsolve.");
    expect(sessionLine([p(true, "fast"), p(true, "slow"), p(false)])).toBe(
      "Two solved, one ahead of pace. One left to upsolve.",
    );
    expect(sessionLine([p(true), p(false)])).toBe(
      "One solved. One left to upsolve.",
    );
  });

  it("covers a clean sheet, an empty one and no problems", () => {
    expect(
      sessionLine([p(true, "fast"), p(true, "fast"), p(true, "fast")]),
    ).toBe("All three solved, all ahead of pace. Nothing left to upsolve.");
    expect(sessionLine([p(false), p(false)])).toBe(
      "None solved this time. Two left to upsolve.",
    );
    expect(sessionLine([])).toBe("");
  });
});

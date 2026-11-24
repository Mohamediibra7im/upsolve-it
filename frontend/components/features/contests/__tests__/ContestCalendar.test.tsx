import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import ContestCalendar from "@/components/features/contests/ContestCalendar";
import type { UpcomingContest } from "@/types/Contest";

let query = "";
jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(query),
}));

const NOW = Date.parse("2026-11-24T00:00:00Z");
const round = (
  judge: UpcomingContest["judge"],
  id: string,
  name: string,
  startsAt: string,
  durationMinutes: number,
): UpcomingContest => ({
  judge,
  id,
  name,
  startsAt,
  durationMinutes,
  url: `https://example.test/${id}`,
});

const contests = [
  round(
    "codeforces",
    "2292",
    "Codeforces Round (Div. 3)",
    "2026-11-27T14:35:00.000Z",
    135,
  ),
  round(
    "atcoder",
    "abc486",
    "AtCoder Beginner Contest 486",
    "2026-11-28T12:00:00.000Z",
    100,
  ),
  // 16:00 UTC on the 28th is already the 29th in Tokyo
  round(
    "codeforces",
    "2286",
    "Kotlin Heroes: Practice 15",
    "2026-11-28T16:00:00.000Z",
    10080,
  ),
];

const show = (unavailable: UpcomingContest["judge"][] = [], list = contests) =>
  render(
    <ContestCalendar
      contests={list}
      unavailable={unavailable}
      renderedAt={NOW}
    />,
  );

describe("ContestCalendar", () => {
  let zone: jest.SpyInstance;
  beforeEach(() => {
    query = "";
    // before the fake clock: it swaps Intl for its own
    zone = jest
      .spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions")
      .mockReturnValue({
        timeZone: "Asia/Tokyo",
      } as Intl.ResolvedDateTimeFormatOptions);
    jest.useFakeTimers({ now: NOW });
  });
  afterEach(() => {
    jest.useRealTimers();
    zone.mockRestore();
  });

  it("features the next round in the visitor's time zone and counts down to it", () => {
    show();
    expect(screen.getByText("Asia/Tokyo (GMT+9)")).toBeTruthy();

    const next = screen.getByRole("region", {
      name: "Codeforces Round (Div. 3)",
    });
    expect(within(next).getByText("23:35")).toBeTruthy();
    expect(within(next).getByText("Fri 27 Nov")).toBeTruthy();
    expect(within(next).getByText("01:50")).toBeTruthy();
    expect(within(next).getByText("Sat 28 Nov")).toBeTruthy();
    expect(within(next).getByText("2h 15m")).toBeTruthy();
    expect(within(next).getByRole("timer").getAttribute("aria-label")).toBe(
      "3 days, 14 hours, 35 minutes, 0 seconds",
    );
    act(() => jest.advanceTimersByTime(1000));
    expect(within(next).getByRole("timer").getAttribute("aria-label")).toBe(
      "3 days, 14 hours, 34 minutes, 59 seconds",
    );
  });

  it("groups the rest by the visitor's own days", () => {
    const { container } = show();
    const saturday = container.querySelector("#day-2026-11-28")!;
    expect(within(saturday as HTMLElement).getByText("21:00")).toBeTruthy();
    expect(saturday.textContent).toContain("AtCoder Beginner Contest 486");
    expect(saturday.textContent).not.toContain("Kotlin Heroes");
    const sunday = container.querySelector("#day-2026-11-29")!;
    expect(sunday.textContent).toContain("01:00");
    expect(sunday.textContent).toContain("7 days");
    expect(sunday.textContent).toContain("in 4d 16h");
    // the calendar shows the same rounds on the visitor's days, each a link
    // to its judge
    expect(
      screen
        .getByRole("link", {
          name: "Sun 29 Nov, 01:00: Kotlin Heroes: Practice 15 on Codeforces",
        })
        .getAttribute("href"),
    ).toBe("https://example.test/2286");
    expect(
      screen.getByRole("link", {
        name: "Fri 27 Nov, 23:35: Codeforces Round (Div. 3) on Codeforces",
      }),
    ).toBeTruthy();
  });

  it("writes UTC on the server, and the browser takes it over without a mismatch", () => {
    const calendar = (
      <ContestCalendar contests={contests} unavailable={[]} renderedAt={NOW} />
    );
    const html = renderToString(calendar);
    expect(html).toContain("14:35");
    expect(html).toContain('id="day-2026-11-28"');
    expect(html).not.toContain("day-2026-11-29");
    expect(html).not.toContain("Asia/Tokyo");

    const page = document.createElement("div");
    page.innerHTML = html;
    const mismatch = jest.fn();
    const errors = jest.mocked(console.error);
    errors.mockClear();
    act(() => {
      hydrateRoot(page, calendar, { onRecoverableError: mismatch });
    });
    expect(mismatch).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(page.textContent).toContain("Asia/Tokyo (GMT+9)");
    expect(page.querySelector("#day-2026-11-29")).not.toBeNull();
  });

  it("keeps to the judge named in the address", () => {
    query = "judge=atcoder";
    show();
    expect(
      screen.getByRole("region", { name: "AtCoder Beginner Contest 486" }),
    ).toBeTruthy();
    expect(screen.queryByText("Codeforces Round (Div. 3)")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: /^AtCoder/ })
        .getAttribute("aria-current"),
    ).toBe("page");

    const replace = jest.spyOn(window.history, "replaceState");
    fireEvent.click(screen.getByRole("link", { name: /^All/ }));
    expect(replace).toHaveBeenCalledWith(null, "", "/contests");
    replace.mockRestore();
  });

  it("says which schedule could not be read, and when nothing is left", () => {
    query = "judge=atcoder";
    show(
      ["atcoder"],
      contests.filter((c) => c.judge === "codeforces"),
    );
    expect(screen.getByRole("status").textContent).toContain(
      "The AtCoder schedule could not be read just now",
    );
    expect(screen.getByText("No rounds to show")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Show every judge" })).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "How it works" }).getAttribute("href"),
    ).toBe("/how-it-works");
  });

  it("drops a round once it has started", () => {
    show();
    jest.setSystemTime(NOW + 4 * 24 * 60 * 60 * 1000);
    act(() => jest.advanceTimersByTime(1000));
    expect(screen.queryByText("Codeforces Round (Div. 3)")).toBeNull();
    expect(
      screen.getByRole("region", { name: "AtCoder Beginner Contest 486" }),
    ).toBeTruthy();
  });
});

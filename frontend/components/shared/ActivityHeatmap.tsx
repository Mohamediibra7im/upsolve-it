"use client";

import ClientOnly from "@/components/shared/ClientOnly";
import { Stat } from "@/components/ui/kit";
import { useHeatmapData } from "@/hooks/data";
import { cn } from "@/lib/utils";
import type { Training } from "@/types/Training";
import type { UpsolveProblem } from "@/types/UpsolveProblem";

const DAY_MS = 86_400_000;

// Below its minimum width the grid scrolls; start at the most recent weeks.
const scrollToEnd = (el: HTMLDivElement | null) => {
  if (el) el.scrollLeft = el.scrollWidth;
};

/** The "Practice activity" panel: one cell per day for the past 12 months, from your sessions and upsolves. */
export default function ActivityHeatmap({
  history,
  upsolvedProblems = [],
  stats = false,
  className,
}: {
  history: Training[];
  upsolvedProblems?: UpsolveProblem[];
  /** Also show the year in four numbers; they sit beside the grid on wide screens. */
  stats?: boolean;
  className?: string;
}) {
  const { values } = useHeatmapData(history, upsolvedProblems);
  const counts = new Map(values.map((v) => [v.date, v.count]));
  const total = values.reduce((sum, v) => sum + v.count, 0);

  // The same window the hook counts: one year back from today, by local day.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const first = new Date(today);
  first.setFullYear(first.getFullYear() - 1);
  const days = Array.from(
    { length: Math.round((today.getTime() - first.getTime()) / DAY_MS) + 1 },
    (_, i) => {
      const date = new Date(
        first.getFullYear(),
        first.getMonth(),
        first.getDate() + i,
      );
      const key = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
      return { date, count: counts.get(key) ?? 0 };
    },
  );
  const active = days.filter((d) => d.count > 0);
  const best = active.reduce<(typeof days)[number] | null>(
    (top, d) => (!top || d.count > top.count ? d : top),
    null,
  );
  let longestRun = 0;
  let run = 0;
  const byWeekday = Array<number>(7).fill(0);
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longestRun = Math.max(longestRun, run);
    byWeekday[d.date.getDay()] += d.count;
  }
  const busiest = byWeekday.indexOf(Math.max(...byWeekday));
  const summary = `${total.toLocaleString()} recorded ${total === 1 ? "milestone" : "milestones"} in the past 12 months`;

  return (
    <section
      className={cn("u-panel", className)}
      aria-labelledby="activity-title"
    >
      <div className="u-panel__head">
        <h2 id="activity-title" className="t-h2">
          Practice activity
        </h2>
        <span className="u-heat-legend" aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((level) => (
            <i key={level} style={{ background: `var(--heat-${level})` }} />
          ))}
          More
        </span>
      </div>
      <ClientOnly>
        <div
          className={cn(
            "u-panel__body grid items-center gap-x-10 gap-y-6",
            stats && "2xl:grid-cols-[minmax(0,920px)_minmax(0,1fr)]",
          )}
        >
          <div className="overflow-x-auto" ref={scrollToEnd}>
            <div
              className="u-heat min-w-[560px] max-w-[920px] auto-cols-fr grid-rows-[repeat(7,auto)] [&>*]:aspect-square"
              role="img"
              aria-label={`Practice activity by day: ${summary}`}
            >
              {Array.from({ length: first.getDay() }, (_, i) => (
                <span key={i} />
              ))}
              {days.map(({ date, count }) => (
                <i
                  key={date.getTime()}
                  data-l={Math.min(count, 4)}
                  title={`${date.toLocaleDateString(undefined, { dateStyle: "medium" })}: ${count} ${count === 1 ? "milestone" : "milestones"}`}
                />
              ))}
            </div>
          </div>
          {stats && (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 2xl:grid-cols-2 2xl:border-l 2xl:border-line 2xl:pl-10">
              <Stat
                label="Active days"
                value={active.length}
                sub="of the past year"
              />
              <Stat
                label="Best day"
                value={best?.count ?? 0}
                sub={
                  best
                    ? best.date.toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })
                    : "No activity yet"
                }
              />
              <Stat
                label="Longest run"
                value={longestRun}
                unit={longestRun === 1 ? "day" : "days"}
                sub="in a row"
              />
              <Stat
                label="Busiest day"
                value={
                  total
                    ? new Date(2024, 0, 7 + busiest).toLocaleDateString(
                        undefined,
                        { weekday: "short" },
                      )
                    : "—"
                }
                sub="of the week"
              />
            </div>
          )}
        </div>
      </ClientOnly>
      <div className="u-panel__foot">
        <span>{summary}</span>
      </div>
    </section>
  );
}

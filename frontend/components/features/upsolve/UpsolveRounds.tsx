"use client";

import { useState } from "react";
import { Check, ExternalLink, Timer, Trash2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { rankKey } from "@/utils/rank";
import type { Round } from "./rounds";
import type { UpsolveProblem } from "./UpsolveRow";

const FILTERS = [
  { key: "open", label: "All rounds" },
  { key: "session", label: "Sessions" },
  { key: "contest", label: "Contests" },
  { key: "cleared", label: "Cleared" },
] as const;
type Filter = (typeof FILTERS)[number]["key"];

const PAGE = 12;

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
/** "Yesterday", "3 days ago", "2 months ago". Empty when the date is unknown. */
function ago(when: number) {
  if (!when) return "";
  const days = Math.round((Date.now() - when) / 86_400_000);
  const text =
    days < 60
      ? relative.format(-days, "day")
      : relative.format(-Math.round(days / 30), "month");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function RoundPanel({
  round,
  showSolved,
  onDelete,
  order,
}: {
  round: Round;
  showSolved: boolean;
  onDelete: (problem: UpsolveProblem) => void;
  order: number;
}) {
  const Icon = round.kind === "session" ? Timer : Trophy;
  const left =
    round.waiting === 0
      ? "all solved"
      : round.kind === "session"
        ? `${round.waiting} of ${round.slots.length} left`
        : `${round.waiting} left to upsolve`;
  const rows = round.problems.filter(
    ({ problem }) => showSolved || !problem.solvedTime,
  );

  return (
    <section
      className="u-panel"
      style={{ order }}
      aria-labelledby={`${round.key}-title`}
    >
      <div className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 border-b border-line px-5 py-4 sm:grid-cols-[36px_minmax(0,1fr)_auto]">
        <span className="grid size-9 place-items-center rounded-md bg-surface-sunk text-ink">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={`${round.key}-title`} className="t-h3 truncate text-ink">
            {round.title}
          </h2>
          <p className="t-sm t-muted">
            {[ago(round.when), left].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ul
          className="col-span-2 flex flex-wrap gap-1 sm:col-span-1"
          aria-label="Problems of this round"
        >
          {round.slots.map((slot) => (
            <li
              key={slot.label}
              className={cn(
                "t-num grid h-[26px] min-w-[26px] place-items-center rounded-sm px-1 text-xs font-semibold",
                slot.state === "solved" && "bg-solved text-ground",
                slot.state === "open" &&
                  "bg-surface-sunk text-ink shadow-[inset_0_0_0_2px_var(--failed)]",
                slot.state === "none" && "bg-surface-sunk text-ink-faint",
              )}
            >
              {slot.label}
              <span className="sr-only">
                {slot.state === "solved"
                  ? ", solved"
                  : slot.state === "open"
                    ? ", waiting"
                    : ", not in your queue"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {rows.map(({ slot, problem }) => {
        const solved = !!problem.solvedTime;
        return (
          <div
            key={slot}
            className="u-prow"
            data-state={solved ? "solved" : "failed"}
          >
            <span className="u-prow__slot">
              {solved ? <Check aria-hidden="true" /> : slot}
            </span>
            <div className="min-w-0">
              <a
                className="u-prow__name block"
                href={problem.url}
                target="_blank"
                rel="noreferrer"
              >
                {problem.name}
              </a>
              <p className="u-prow__meta truncate">
                <span className="t-num">
                  {problem.contestId}
                  {problem.index}
                </span>
                {problem.tags?.length
                  ? ` · ${problem.tags.slice(0, 3).join(" · ")}`
                  : ""}
              </p>
            </div>
            {problem.rating ? (
              <span
                className="u-rank t-num"
                data-rank={rankKey(problem.rating)}
              >
                {problem.rating}
              </span>
            ) : (
              <span className="u-prow__rating">—</span>
            )}
            <div className="flex items-center gap-0.5">
              <a
                className="u-btn u-btn--ghost u-btn--icon u-btn--sm"
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${problem.name}`}
              >
                <ExternalLink aria-hidden="true" />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="u-btn--sm"
                onClick={() => onDelete(problem)}
                aria-label={`Remove ${problem.name} from your upsolve queue`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/** The upsolve queue grouped by the session or contest each problem was missed in. */
export default function UpsolveRounds({
  rounds,
  onDelete,
}: {
  rounds: Round[];
  onDelete: (problem: UpsolveProblem) => void;
}) {
  const [filter, setFilter] = useState<Filter>("open");
  const [limit, setLimit] = useState(PAGE);

  const open = rounds.filter((r) => r.waiting > 0);
  const lists: Record<Filter, Round[]> = {
    open,
    session: open.filter((r) => r.kind === "session"),
    contest: open.filter((r) => r.kind === "contest"),
    cleared: rounds.filter((r) => r.waiting === 0),
  };
  const shown = lists[filter].slice(0, limit);

  const total = rounds.reduce((n, r) => n + r.problems.length, 0);
  const waiting = rounds.reduce((n, r) => n + r.waiting, 0);
  const cleared = total > 0 ? Math.round(((total - waiting) / total) * 100) : 0;

  // Two columns on wide screens: each round goes to the shorter one, so the
  // newest stay on top. On narrow screens the columns dissolve and `order`
  // puts the rounds back in one list.
  const columns: { round: Round; order: number }[][] = [[], []];
  const height = [0, 0];
  shown.forEach((round, order) => {
    const rows = filter === "cleared" ? round.problems.length : round.waiting;
    const to = height[1] < height[0] ? 1 : 0;
    columns[to].push({ round, order });
    height[to] += rows + 2;
  });

  const facts = [
    { value: waiting, label: "waiting" },
    {
      value: open.length,
      label:
        open.length === 1
          ? "round with something left"
          : "rounds with something left",
    },
    { value: `${cleared}%`, label: "cleared" },
  ];

  return (
    <div className="grid gap-6">
      <div className="u-panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          {facts.map(({ value, label }) => (
            <span key={label} className="t-sm t-muted">
              <b className="t-num mr-2 text-[22px] font-semibold tracking-tight text-ink">
                {value}
              </b>
              {label}
            </span>
          ))}
          <Bar
            value={cleared}
            label="Share of your queue solved"
            className="w-40"
          />
        </div>
        <div
          className="u-seg max-w-full overflow-x-auto"
          role="group"
          aria-label="Show rounds"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => {
                setFilter(key);
                setLimit(PAGE);
              }}
            >
              {label} <span className="t-num">{lists[key].length}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={
            filter === "cleared"
              ? "No round cleared yet."
              : "Nothing left here."
          }
        >
          {filter === "cleared"
            ? "Solve every problem a round left behind, then sync. The round moves here."
            : filter === "open"
              ? "Every problem in your queue is solved."
              : `No ${filter} has a problem waiting.`}
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {columns.map((column, i) => (
            <div key={i} className="contents lg:grid lg:gap-6">
              {column.map(({ round, order }) => (
                <RoundPanel
                  key={round.key}
                  round={round}
                  order={order}
                  showSolved={filter === "cleared"}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {lists[filter].length > limit && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit(limit + PAGE)}>
            Show {Math.min(PAGE, lists[filter].length - limit)} more rounds
          </Button>
        </div>
      )}
    </div>
  );
}

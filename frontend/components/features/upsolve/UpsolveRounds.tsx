"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  NotebookPen,
  RotateCcw,
  Timer,
  Trash2,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bar, EmptyState } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { rankKey } from "@/utils/rank";
import type { Training } from "@/types/Training";
import {
  isResolveDue,
  judgeOf,
  problemId,
  type UpsolveProblem,
} from "@/types/UpsolveProblem";
import {
  NO_FILTERS,
  activeFilterCount,
  filterProblems,
  filtersToSearch,
  parseFilters,
  sortRounds,
  type QueueFilters,
} from "./filters";
import NoteEditor from "./NoteEditor";
import { ActiveFilters, QueueFilterButton } from "./QueueFilter";
import { buildRounds, contestOf, type Round } from "./rounds";

/** What a row can do; the page owns the requests. */
type RowActions = {
  onDelete: (problem: UpsolveProblem) => void;
  onSaveNote: (problem: UpsolveProblem, note: string) => Promise<void>;
  onSkipResolve: (problem: UpsolveProblem) => Promise<void>;
};

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

/** "1996D" on Codeforces, "ABC300 E" on AtCoder. */
const shortId = (p: UpsolveProblem) =>
  judgeOf(p) === "atcoder"
    ? `${String(p.contestId).toUpperCase()} ${p.index}`
    : `${p.contestId}${p.index}`;

function ProblemRow({
  slot,
  problem,
  noteOpen,
  onToggleNote,
  actions,
}: {
  slot: string;
  problem: UpsolveProblem;
  noteOpen: boolean;
  onToggleNote: () => void;
  actions: RowActions;
}) {
  const [skipping, setSkipping] = useState(false);
  const solved = !!problem.solvedTime;
  const resolve = isResolveDue(problem);
  const noteId = `note-${problemId(problem).replace(/[^\w-]/g, "-")}`;
  const hasNote = !!problem.note?.trim();
  const facts = [
    ...(problem.tags ?? []).slice(0, 3),
    judgeOf(problem) === "atcoder" && "AtCoder",
    problem.source === "unattempted" && "not tried yet",
    problem.source === "manual" && "added by link",
  ].filter(Boolean);

  return (
    <>
      <div
        className="u-prow"
        data-state={resolve ? undefined : solved ? "solved" : "failed"}
      >
        <span
          className={cn(
            "u-prow__slot",
            resolve && "shadow-[inset_0_0_0_2px_var(--pending)]",
          )}
        >
          {solved && !resolve ? <Check aria-hidden="true" /> : slot}
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
            <span className="t-num">{shortId(problem)}</span>
            {facts.length > 0 && ` · ${facts.join(" · ")}`}
          </p>
          {/* under the name, so a narrow row still has room for the name */}
          {resolve && (
            <Badge variant="pending" className="mt-1.5">
              <RotateCcw aria-hidden="true" />
              Re-solve due
            </Badge>
          )}
        </div>
        {problem.rating ? (
          <span
            className="u-rank t-num"
            data-rank={rankKey(problem.rating)}
            title={
              judgeOf(problem) === "atcoder"
                ? "Estimated from its AtCoder difficulty, on the Codeforces scale"
                : undefined
            }
          >
            {judgeOf(problem) === "atcoder" && (
              <>
                <span aria-hidden="true">≈</span>
                <span className="sr-only">about</span>
              </>
            )}
            {problem.rating}
          </span>
        ) : (
          <span className="u-prow__rating">—</span>
        )}
        <div className="flex flex-wrap items-center gap-0.5">
          {resolve && (
            <>
              <Button
                variant="ghost"
                size="sm"
                disabled={skipping}
                aria-label={`Skip the re-solve of ${problem.name}`}
                onClick={async () => {
                  setSkipping(true);
                  await actions.onSkipResolve(problem).catch(() => {});
                  setSkipping(false);
                }}
              >
                Skip
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("u-btn--sm", hasNote && "text-accent-ink")}
            aria-expanded={noteOpen}
            aria-controls={noteOpen ? noteId : undefined}
            aria-label={`${hasNote ? "Open your note on" : "Write a note on"} ${problem.name}`}
            title={hasNote ? "Your note" : "Write a note"}
            onClick={onToggleNote}
          >
            <NotebookPen aria-hidden="true" />
          </Button>
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
            onClick={() => actions.onDelete(problem)}
            aria-label={`Remove ${problem.name} from your upsolve queue`}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
      {noteOpen && (
        <NoteEditor
          id={noteId}
          problem={problem}
          onSave={actions.onSaveNote}
          onClose={onToggleNote}
        />
      )}
    </>
  );
}

function RoundPanel({
  round,
  showSolved,
  order,
  openNote,
  onToggleNote,
  actions,
}: {
  round: Round;
  showSolved: boolean;
  order: number;
  openNote: string | null;
  onToggleNote: (id: string) => void;
  actions: RowActions;
}) {
  const Icon = round.kind === "session" ? Timer : Trophy;
  const left = [
    round.waiting === 0
      ? round.resolving === 0 && "all solved"
      : round.kind === "session"
        ? `${round.waiting} of ${round.slots.length} left`
        : `${round.waiting} left to upsolve`,
    round.resolving > 0 && `${round.resolving} to re-solve`,
  ].filter(Boolean);
  const rows = round.problems.filter(
    ({ problem }) => showSolved || !problem.solvedTime || isResolveDue(problem),
  );

  return (
    <section
      className="u-panel"
      style={{ order }}
      aria-labelledby={`${round.key}-title`}
    >
      <div className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 border-b border-line px-5 py-4 max-sm:px-4 sm:grid-cols-[36px_minmax(0,1fr)_auto]">
        <span className="grid size-9 place-items-center rounded-md bg-surface-sunk text-ink">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={`${round.key}-title`} className="t-h3 truncate text-ink">
            {round.title}
          </h2>
          <p className="t-sm t-muted">
            {[ago(round.when), ...left].filter(Boolean).join(" · ")}
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
                slot.state === "resolve" &&
                  "bg-surface-sunk text-ink shadow-[inset_0_0_0_2px_var(--pending)]",
                slot.state === "none" && "bg-surface-sunk text-ink-faint",
              )}
            >
              {slot.label}
              <span className="sr-only">
                {slot.state === "solved"
                  ? ", solved"
                  : slot.state === "open"
                    ? ", waiting"
                    : slot.state === "resolve"
                      ? ", due to be solved again"
                      : ", not in your queue"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {rows.map(({ slot, problem }) => {
        const id = problemId(problem);
        return (
          <ProblemRow
            key={id}
            slot={slot}
            problem={problem}
            noteOpen={openNote === id}
            onToggleNote={() => onToggleNote(id)}
            actions={actions}
          />
        );
      })}
    </section>
  );
}

/**
 * The upsolve queue grouped by the session or contest each problem was missed
 * in, with one Filter button to sort and narrow it. The filters live in the
 * page address, so a refresh or a shared link keeps them.
 */
export default function UpsolveRounds({
  problems,
  history,
  ...actions
}: { problems: UpsolveProblem[]; history: Training[] } & RowActions) {
  const [filter, setFilter] = useState<Filter>("open");
  const [limit, setLimit] = useState(PAGE);
  const [openNote, setOpenNote] = useState<string | null>(null);
  // This component only ever renders in the browser, after the queue loads.
  const [filters, setFilters] = useState<QueueFilters>(() =>
    typeof window === "undefined"
      ? NO_FILTERS
      : parseFilters(window.location.search),
  );
  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + filtersToSearch(filters),
    );
  }, [filters]);
  const changeFilters = (next: QueueFilters) => {
    setFilters(next);
    setLimit(PAGE);
  };

  const { tags, contests } = useMemo(() => {
    const byKey = new Map(
      problems.map((p) => [contestOf(p).key, contestOf(p)] as const),
    );
    return {
      tags: [...new Set(problems.flatMap((p) => p.tags ?? []))].sort(),
      contests: [...byKey.values()].sort((a, b) =>
        a.title.localeCompare(b.title, "en", { numeric: true }),
      ),
    };
  }, [problems]);
  const rounds = useMemo(
    () =>
      sortRounds(
        buildRounds(filterProblems(problems, filters), history),
        filters.sort,
      ),
    [problems, history, filters],
  );

  const open = rounds.filter((r) => r.waiting > 0 || r.resolving > 0);
  const lists: Record<Filter, Round[]> = {
    open,
    session: open.filter((r) => r.kind === "session"),
    contest: open.filter((r) => r.kind === "contest"),
    cleared: rounds.filter((r) => r.waiting === 0 && r.resolving === 0),
  };
  const shown = lists[filter].slice(0, limit);

  const total = rounds.reduce((n, r) => n + r.problems.length, 0);
  const waiting = rounds.reduce((n, r) => n + r.waiting, 0);
  const resolving = rounds.reduce((n, r) => n + r.resolving, 0);
  const cleared = total > 0 ? Math.round(((total - waiting) / total) * 100) : 0;
  const narrowed = activeFilterCount(filters) > 0;
  const allWaiting = problems.filter((p) => !p.solvedTime).length;

  // Two columns on wide screens: each round goes to the shorter one, so the
  // newest stay on top. On narrow screens the columns dissolve and `order`
  // puts the rounds back in one list.
  const columns: { round: Round; order: number }[][] = [[], []];
  const height = [0, 0];
  shown.forEach((round, order) => {
    const rows =
      filter === "cleared"
        ? round.problems.length
        : round.waiting + round.resolving;
    const to = height[1] < height[0] ? 1 : 0;
    columns[to].push({ round, order });
    height[to] += rows + 2;
  });

  const facts = [
    {
      value: waiting,
      label: narrowed ? `of ${allWaiting} waiting` : "waiting",
    },
    ...(resolving > 0 ? [{ value: resolving, label: "to re-solve" }] : []),
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
      <div className="u-panel flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5 max-sm:px-4">
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
        <div className="flex max-w-full flex-wrap items-center gap-3">
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
          <QueueFilterButton
            filters={filters}
            onChange={changeFilters}
            tags={tags}
            contests={contests}
          />
        </div>
      </div>

      <ActiveFilters
        filters={filters}
        onChange={changeFilters}
        contests={contests}
      />

      {shown.length === 0 ? (
        <EmptyState
          title={
            narrowed
              ? "No problem matches these filters."
              : filter === "cleared"
                ? "No round cleared yet."
                : "Nothing left here."
          }
          action={
            narrowed && (
              <Button
                variant="outline"
                onClick={() =>
                  changeFilters({ ...NO_FILTERS, sort: filters.sort })
                }
              >
                Clear the filters
              </Button>
            )
          }
        >
          {narrowed
            ? "Widen the rating range or remove a tag to see more of your queue."
            : filter === "cleared"
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
                  openNote={openNote}
                  onToggleNote={(id) =>
                    setOpenNote((current) => (current === id ? null : id))
                  }
                  actions={actions}
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

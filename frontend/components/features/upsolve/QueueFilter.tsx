"use client";

import * as Popover from "@radix-ui/react-popover";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NO_FILTERS,
  SORTS,
  activeFilterCount,
  type QueueFilters,
} from "./filters";

type Props = {
  filters: QueueFilters;
  onChange: (filters: QueueFilters) => void;
  /** Every tag a queued problem carries. */
  tags: string[];
  /** Every contest with a problem in the queue. */
  contests: { key: string; title: string }[];
};

const ratingOf = (text: string) => {
  const n = Number.parseInt(text, 10);
  return Number.isFinite(n) && n >= 0 ? Math.min(n, 5000) : null;
};

/** One button for sorting and narrowing the queue. */
export function QueueFilterButton({
  filters,
  onChange,
  tags,
  contests,
}: Props) {
  const active = activeFilterCount(filters);
  const toggleTag = (tag: string) =>
    onChange({
      ...filters,
      tags: filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag],
    });

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal aria-hidden="true" />
          Filter
          {active > 0 && (
            <>
              <span aria-hidden="true">· {active}</span>
              <span className="sr-only">, {active} active</span>
            </>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="u-panel u-panel--pop z-[60] grid max-h-[var(--radix-popover-content-available-height)] w-[23rem] max-w-[calc(100vw-1.5rem)] gap-4 overflow-y-auto p-5"
        >
          <div className="grid gap-2">
            <span className="u-stat__label" id="queue-sort">
              Sort rounds
            </span>
            <div
              className="u-seg max-w-full overflow-x-auto"
              role="group"
              aria-labelledby="queue-sort"
            >
              {SORTS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filters.sort === key}
                  onClick={() => onChange({ ...filters, sort: key })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {tags.length > 0 && (
            <div className="grid gap-2">
              <span className="u-stat__label" id="queue-tags">
                Tags
              </span>
              <div
                className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto"
                role="group"
                aria-labelledby="queue-tags"
              >
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="u-chip"
                    aria-pressed={filters.tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <fieldset className="grid gap-2">
            <legend className="u-stat__label mb-2">Rating</legend>
            <div className="flex items-center gap-2">
              <label htmlFor="queue-min" className="sr-only">
                Lowest rating
              </label>
              <input
                id="queue-min"
                className="u-input t-num h-10"
                type="number"
                inputMode="numeric"
                min={0}
                max={5000}
                step={100}
                placeholder="800"
                value={filters.min ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, min: ratingOf(e.target.value) })
                }
              />
              <span className="t-muted" aria-hidden="true">
                –
              </span>
              <label htmlFor="queue-max" className="sr-only">
                Highest rating
              </label>
              <input
                id="queue-max"
                className="u-input t-num h-10"
                type="number"
                inputMode="numeric"
                min={0}
                max={5000}
                step={100}
                placeholder="3500"
                value={filters.max ?? ""}
                onChange={(e) =>
                  onChange({ ...filters, max: ratingOf(e.target.value) })
                }
              />
            </div>
          </fieldset>

          <div className="grid gap-2">
            <label className="u-stat__label" htmlFor="queue-contest">
              Contest
            </label>
            <select
              id="queue-contest"
              className="u-input h-10"
              value={filters.contest}
              onChange={(e) =>
                onChange({ ...filters, contest: e.target.value })
              }
            >
              <option value="">Any contest</option>
              {contests.map(({ key, title }) => (
                <option key={key} value={key}>
                  {title}
                </option>
              ))}
            </select>
          </div>

          {(active > 0 || filters.sort !== NO_FILTERS.sort) && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={() => onChange(NO_FILTERS)}
            >
              Reset sort and filters
            </Button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** What is narrowing the queue right now, each removable on its own. */
export function ActiveFilters({
  filters,
  onChange,
  contests,
}: Omit<Props, "tags">) {
  if (activeFilterCount(filters) === 0) return null;
  const range =
    filters.min !== null && filters.max !== null
      ? `${filters.min}–${filters.max}`
      : filters.min !== null
        ? `${filters.min} and up`
        : `up to ${filters.max}`;
  const chips: { label: string; without: QueueFilters }[] = [
    ...filters.tags.map((tag) => ({
      label: tag,
      without: { ...filters, tags: filters.tags.filter((t) => t !== tag) },
    })),
    ...(filters.min !== null || filters.max !== null
      ? [{ label: range, without: { ...filters, min: null, max: null } }]
      : []),
    ...(filters.contest
      ? [
          {
            label:
              contests.find((c) => c.key === filters.contest)?.title ??
              "One contest",
            without: { ...filters, contest: "" },
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map(({ label, without }) => (
        <button
          key={label}
          type="button"
          className="u-chip"
          aria-pressed="true"
          aria-label={`Remove filter: ${label}`}
          onClick={() => onChange(without)}
        >
          {label}
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange({ ...NO_FILTERS, sort: filters.sort })}
      >
        Clear all
      </Button>
    </div>
  );
}

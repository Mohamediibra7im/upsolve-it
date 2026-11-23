"use client";

import { useState, type KeyboardEvent } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/** "YYYY-MM-DDTHH:mm" in local time: the same text a datetime-local input holds. */
export const toLocalValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const parse = (value?: string) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * A date and time field in the site's style. `value` and `onChange` use the
 * local "YYYY-MM-DDTHH:mm" text of a datetime-local input ("" when empty), so
 * it drops in where one was. Days before `min` cannot be picked.
 */
export function DateTimePicker({
  id,
  value,
  onChange,
  min,
  placeholder = "Pick a date and time",
  ...aria
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const selected = parse(value);
  const earliest = parse(min);
  const [open, setOpen] = useState(false);
  // The month on show, as its first day.
  const [month, setMonth] = useState(() => {
    const d = selected ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const today = new Date();
  const gridStart = new Date(month);
  gridStart.setDate(1 - month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
  const sameDay = (a: Date, b: Date | null) =>
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const tooEarly = (d: Date) =>
    !!earliest &&
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59) < earliest;

  // A new date keeps the chosen time; a first pick starts at the next full hour.
  const pick = (next: { day?: Date; hour?: number; minute?: number }) => {
    const base = selected ?? new Date(today.getTime() + 3_600_000);
    const day = next.day ?? base;
    onChange(
      toLocalValue(
        new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          next.hour ?? base.getHours(),
          next.minute ?? (selected ? base.getMinutes() : 0),
        ),
      ),
    );
  };
  const shiftMonth = (by: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  // Arrow keys walk the days; Page Up and Page Down change the month.
  const onGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[
      e.key
    ];
    if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      shiftMonth(e.key === "PageUp" ? -1 : 1);
    } else if (step) {
      e.preventDefault();
      const cells = [
        ...e.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
      ];
      cells[
        cells.indexOf(document.activeElement as HTMLButtonElement) + step
      ]?.focus();
    }
  };

  // A 12-hour clock: 1 to 12 with AM or PM. Before a pick, the hour is the one
  // the first pick will start at.
  const hours = (selected ?? new Date(today.getTime() + 3_600_000)).getHours();
  const hour12 = selected ? hours % 12 || 12 : null;
  const isPm = hours >= 12;

  // Hour and minute are typed: two digits each, arrow keys step by one.
  const timeInput = (
    label: string,
    current: number | null,
    min: number,
    max: number,
    set: (n: number) => void,
  ) => (
    <input
      aria-label={label}
      inputMode="numeric"
      autoComplete="off"
      placeholder="--"
      className="u-input t-num h-9 w-14 px-0 text-center"
      value={current === null ? "" : pad(current)}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        // the field always shows two digits, so the last two typed are the value
        const digits = e.target.value.replace(/\D/g, "").slice(-2);
        if (!digits) return;
        // "0" on its way to "10": wait for the next digit
        if (Number(digits) < min && Number(digits.slice(-1)) < min) return;
        const n = Number(digits);
        set(n > max || n < min ? Number(digits.slice(-1)) : n);
      }}
      onKeyDown={(e) => {
        const step = e.key === "ArrowUp" ? 1 : e.key === "ArrowDown" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const span = max - min + 1;
        set(min + (((current ?? min) - min + step + span) % span));
      }}
    />
  );

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && selected)
          setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          className="u-input flex items-center justify-between gap-3 text-left"
          {...aria}
        >
          <span
            className={cn("min-w-0 truncate", !selected && "text-ink-faint")}
          >
            {selected
              ? selected.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })
              : placeholder}
          </span>
          <Calendar
            className="size-4 shrink-0 text-ink-muted"
            aria-hidden="true"
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          aria-label="Choose a date and time"
          className="u-panel u-panel--pop z-[60] grid w-[21rem] max-w-[calc(100vw-1.5rem)] gap-3 p-3 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="u-btn u-btn--ghost u-btn--icon u-btn--sm"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
            >
              <ChevronLeft />
            </button>
            <span className="t-h3" aria-live="polite">
              {month.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              className="u-btn u-btn--ghost u-btn--icon u-btn--sm"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
            >
              <ChevronRight />
            </button>
          </div>

          <div
            className="grid grid-cols-7 justify-items-center gap-y-1"
            onKeyDown={onGridKey}
          >
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="t-num grid size-9 place-items-center text-[11px] uppercase tracking-wider text-ink-muted"
                aria-hidden="true"
              >
                {day}
              </span>
            ))}
            {days.map((day) => {
              const isSelected = sameDay(day, selected);
              return (
                <button
                  key={day.getTime()}
                  type="button"
                  disabled={tooEarly(day)}
                  aria-pressed={isSelected}
                  aria-label={day.toLocaleDateString(undefined, {
                    dateStyle: "full",
                  })}
                  onClick={() => pick({ day })}
                  className={cn(
                    "t-num grid size-9 place-items-center rounded-sm text-[13px] hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
                    day.getMonth() !== month.getMonth() && "text-ink-faint",
                    sameDay(day, today) &&
                      "shadow-[inset_0_0_0_1px_var(--line-strong)]",
                    isSelected &&
                      "bg-primary font-semibold text-primary-foreground hover:bg-primary",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-t border-line pt-3">
            <span className="t-eyebrow mr-auto">Time</span>
            {timeInput("Hour", hour12, 1, 12, (h) =>
              pick({ hour: (h % 12) + (isPm ? 12 : 0) }),
            )}
            <span className="t-num text-ink-muted" aria-hidden="true">
              :
            </span>
            {timeInput(
              "Minute",
              selected ? selected.getMinutes() : null,
              0,
              59,
              (minute) => pick({ minute }),
            )}
            <div className="u-seg" role="group" aria-label="AM or PM">
              {["AM", "PM"].map((half) => {
                const pm = half === "PM";
                return (
                  <button
                    key={half}
                    type="button"
                    aria-pressed={!!selected && isPm === pm}
                    onClick={() =>
                      pick({ hour: ((hour12 ?? 12) % 12) + (pm ? 12 : 0) })
                    }
                  >
                    {half}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
            <button
              type="button"
              className="u-btn u-btn--ghost u-btn--sm"
              disabled={!selected}
              onClick={() => onChange("")}
            >
              Clear
            </button>
            <Popover.Close className="u-btn u-btn--sm">Done</Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

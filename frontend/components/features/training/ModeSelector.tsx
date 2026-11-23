"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { TrainingMode } from "@/types/TrainingMode";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
// One list of modes for the public pages and the training room.
import { MODES } from "@/components/features/landing/modes";
import { cn } from "@/lib/utils";

const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)}`;

/** Where a mode's problems sit: a range around your rating, or four targets
 *  that rise with your level. Both forms are the same height, so the lanes
 *  line up. The fills turn volt when the lane is hovered. */
function Difficulty({ window }: { window?: [from: number, to: number] }) {
  const fill =
    "bg-line-strong transition-colors group-hover:bg-primary group-focus-visible:bg-primary";
  // The same scale as the public modes page: 400 below your rating to 300 above.
  const at = (rating: number) => `${((rating + 400) / 700) * 100}%`;
  return (
    <>
      <span className="flex h-7 items-end gap-1" aria-hidden="true">
        {window ? (
          <span className="relative mb-1.5 block h-2 w-full rounded-full bg-surface-sunk">
            <i
              className={cn("absolute inset-y-0 rounded-full", fill)}
              style={{
                left: at(window[0]),
                right: `calc(100% - ${at(window[1])})`,
              }}
            />
            <i
              className="absolute -inset-y-1.5 w-0.5 bg-ink"
              style={{ left: at(0) }}
            />
          </span>
        ) : (
          [40, 60, 80, 100].map((height) => (
            <i
              key={height}
              className={cn("w-full rounded-[1px]", fill)}
              style={{ height: `${height}%` }}
            />
          ))
        )}
      </span>
      <span className="t-sm t-muted">
        {window
          ? `${signed(window[0])} to ${signed(window[1])} around your rating`
          : "Four targets, rising with your level"}
      </span>
    </>
  );
}

/** One row of a closed lane. Rows share the grid's tracks, so every lane's
 *  rows start and end on the same lines. */
function Row({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <span className="grid content-start gap-2 border-t border-line px-4 py-4 first:border-t-0 xl:px-5">
      {label && <span className="t-eyebrow">{label}</span>}
      {children}
    </span>
  );
}

/** The five modes as lanes: side by side from `lg`, a list below it.
 *  The chosen lane is open and holds its setup (`children`). */
export default function ModeSelector({
  value,
  onChange,
  ready,
  children,
}: {
  value: TrainingMode;
  onChange: (m: TrainingMode) => void;
  /** A set exists for the open lane. */
  ready: boolean;
  children: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const chosen = useRef(false);

  // The lane that was clicked is replaced by the open one: keep focus with it.
  useEffect(() => {
    if (chosen.current) heading.current?.focus();
    chosen.current = false;
  }, [value]);

  return (
    <div
      role="group"
      aria-label="Training mode"
      className="grid gap-3 lg:grid-cols-[var(--lanes)] lg:grid-rows-[repeat(5,auto)] lg:gap-y-0 xl:gap-x-4"
      style={
        {
          "--lanes": MODES.map((mode) =>
            mode.id === value ? "minmax(0,3fr)" : "minmax(0,1fr)",
          ).join(" "),
        } as CSSProperties
      }
    >
      {MODES.map((mode) =>
        mode.id === value ? (
          <section
            key={mode.id}
            aria-labelledby="open-lane-heading"
            className="u-panel u-panel--pop flex flex-col border-t-4 border-line-strong border-t-primary lg:row-span-5"
          >
            <div className="flex items-start justify-between gap-4 px-4 pb-5 pt-6 sm:px-6">
              <div className="grid min-w-0 gap-1.5">
                <h2
                  id="open-lane-heading"
                  ref={heading}
                  tabIndex={-1}
                  className="t-h1 flex items-center gap-2.5 outline-none"
                >
                  <mode.icon className="size-6 shrink-0" aria-hidden="true" />
                  {mode.name}
                </h2>
                <p className="t-muted">
                  {mode.purpose} {mode.set} problems, {mode.minutes} min.
                </p>
              </div>
              {ready && (
                <Badge variant="solved">
                  <Check aria-hidden="true" />
                  Set ready
                </Badge>
              )}
            </div>
            {children}
          </section>
        ) : (
          <button
            key={mode.id}
            type="button"
            aria-pressed={false}
            onClick={() => {
              chosen.current = true;
              onChange(mode.id as TrainingMode);
            }}
            className="group u-panel text-left transition-colors hover:border-primary focus-visible:border-primary lg:row-span-5 lg:grid lg:grid-rows-subgrid"
          >
            {/* below lg: one compact row */}
            <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-4 py-3 lg:hidden">
              <span className="grid size-10 place-items-center rounded-sm bg-surface-sunk">
                <mode.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="grid">
                <b className="t-h2">{mode.name}</b>
                <span className="t-num t-sm text-ink-muted">
                  {mode.set} problems · {mode.minutes} min
                </span>
              </span>
              <span className="u-btn u-btn--sm">Choose</span>
            </span>

            {/* from lg: five rows on the lanes' shared tracks */}
            <span className="hidden lg:contents">
              <Row>
                <span className="grid size-10 place-items-center rounded-sm bg-surface-sunk transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:bg-primary group-focus-visible:text-primary-foreground">
                  <mode.icon className="size-5" aria-hidden="true" />
                </span>
                <b className="t-h2 mt-1 lg:max-xl:text-[20px]">{mode.name}</b>
                <span className="t-sm t-muted">{mode.purpose}</span>
              </Row>
              <Row label="Time">
                <span className="t-num flex flex-wrap items-baseline gap-x-2 font-semibold leading-none tracking-tight">
                  <span
                    className={
                      mode.minutes.length > 3
                        ? "text-[22px] xl:text-[26px]"
                        : "text-[40px]"
                    }
                  >
                    {mode.minutes}
                  </span>
                  <span className="text-[13px] font-medium text-ink-muted">
                    min
                  </span>
                </span>
              </Row>
              <Row label="Set">
                <span className="font-semibold">{mode.set} problems</span>
                {/* the session sheet's slots: dashed ones are not in every set */}
                <span className="flex flex-wrap gap-1.5" aria-hidden="true">
                  {[..."ABCDEFGH"]
                    .slice(0, mode.set === "4" ? 4 : 8)
                    .map((slot, i) => (
                      <i
                        key={slot}
                        className={cn(
                          "t-num grid size-6 place-items-center rounded-[2px] text-[10px] not-italic text-ink-muted",
                          i < 6
                            ? "bg-surface-sunk"
                            : "border border-dashed border-line-strong",
                        )}
                      >
                        {slot}
                      </i>
                    ))}
                </span>
              </Row>
              <Row label="Difficulty">
                <Difficulty window={mode.window} />
              </Row>
              <Row>
                <span className="u-btn u-btn--sm w-full justify-between transition-colors group-hover:border-primary">
                  Choose <ArrowRight aria-hidden="true" />
                </span>
              </Row>
            </span>
          </button>
        ),
      )}
    </div>
  );
}

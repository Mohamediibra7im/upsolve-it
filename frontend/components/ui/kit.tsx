import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { rankKey, rankName } from "@/utils/rank";

/** Small pieces of the design system that every page uses.
 *  Their styles are the u-* and t-* classes in app/globals.css. */

/** Page title block: eyebrow, title, and the page's one main action on the right. */
export function PageHead({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="t-eyebrow">{eyebrow}</p>}
        <h1 className="t-h1 mt-2">{title}</h1>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </header>
  );
}

/** A labelled number. `unit` renders small beside the value ("6 days"). */
export function Stat({
  label,
  value,
  unit,
  sub,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("u-stat", className)}>
      <span className="u-stat__label">{label}</span>
      <span className="u-stat__value">
        {value}
        {unit && <small>{unit}</small>}
      </span>
      {sub && <span className="u-stat__sub">{sub}</span>}
    </div>
  );
}

/** Codeforces rank: its colour plus its name, never the colour alone. */
export function Rank({
  rating,
  name,
  showRating = false,
  className,
}: {
  rating?: number | null;
  /** Override the name (e.g. the rank string Codeforces returned). */
  name?: string;
  showRating?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("u-rank", className)} data-rank={rankKey(rating)}>
      <span className="capitalize">{name || rankName(rating)}</span>
      {showRating && !!rating && <span className="t-num">{rating}</span>}
    </span>
  );
}

/** Progress bar. `value` is 0–100. */
export function Bar({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span
      className={cn("u-bar", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={v}
    >
      <i style={{ width: `${v}%` }} />
    </span>
  );
}

/** Empty state: three empty slots, a title, a line, and one action. No illustration. */
export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("u-empty", className)}>
      <div className="u-empty__slots" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <h2 className="t-h2">{title}</h2>
      {children && <p className="t-muted max-w-md">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

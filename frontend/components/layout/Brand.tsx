import { cn } from "@/lib/utils";

/** The mark: a U with an up arrow on a rounded tile. Geometry never changes;
 *  the tile takes `accent` and the stroke `on-accent` (see .u-mark). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("u-mark size-7 shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" />
      <path
        d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("u-brand", className)}>
      <BrandMark />
      {!compact && (
        <span>
          Upsolve<em>It</em>
        </span>
      )}
    </span>
  );
}

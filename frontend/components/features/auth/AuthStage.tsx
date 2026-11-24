import type { ReactNode } from "react";
import Link from "next/link";
import Brand from "@/components/layout/Brand";
import BrandIcon from "@/components/shared/BrandIcon";
import { cn } from "@/lib/utils";

/** A stable 0 to 4 for each square: the same on the server and in every browser. */
function heatLevel(i: number) {
  let h = Math.imul(i + 1, 2654435761) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  const f = ((h ^ (h >>> 13)) >>> 0) / 4294967296;
  return f < 0.5 ? 0 : f < 0.72 ? 1 : f < 0.87 ? 2 : f < 0.95 ? 3 : 4;
}
const HEAT = Array.from({ length: 720 }, (_, i) => heatLevel(i));

/** "Works with" and the judges' own marks. */
export function WorksWith() {
  return (
    <p className="t-sm t-muted flex flex-wrap items-center gap-x-3.5 gap-y-2">
      Works with
      <span className="inline-flex items-center gap-1.5">
        <BrandIcon name="codeforces" />
        Codeforces
      </span>
      <span className="inline-flex items-center gap-1.5">
        <BrandIcon name="atcoder" />
        AtCoder
      </span>
    </p>
  );
}

/**
 * The frame of the login and reset pages: a raised sheet in the middle of a
 * ground of practice-heatmap squares. `aside` ends the top row, `foot` fills
 * the bottom one, and the children are the sheet.
 */
export default function AuthStage({
  aside,
  foot,
  className,
  children,
}: {
  aside: ReactNode;
  foot: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative grid grid-rows-[auto_1fr_auto] overflow-hidden">
      <div aria-hidden="true" className="u-heat u-heat-ground">
        {HEAT.map((level, i) => (
          <i key={i} data-l={level || undefined} />
        ))}
      </div>

      <header className="relative bg-[linear-gradient(180deg,var(--ground)_40%,transparent)]">
        <div className="mx-auto flex w-full max-w-[var(--container)] flex-wrap items-center justify-between gap-3 px-[var(--gutter)] py-6">
          <Link href="/" aria-label="Upsolve It home">
            <Brand />
          </Link>
          {aside}
        </div>
      </header>

      <section
        className={cn(
          "u-panel u-panel--stage relative my-4 grid w-[min(460px,calc(100%-2*var(--gutter)))] gap-5 place-self-center p-6 sm:p-9",
          className,
        )}
      >
        {children}
      </section>

      <footer className="relative bg-[linear-gradient(0deg,var(--ground)_55%,transparent)]">
        <div className="mx-auto flex w-full max-w-[var(--container)] flex-wrap items-end justify-between gap-x-6 gap-y-4 px-[var(--gutter)] py-6">
          {foot}
        </div>
      </footer>
    </div>
  );
}

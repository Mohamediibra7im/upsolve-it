"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "What's New" floating action button - positioned above the Help FAB.
 * Includes a Suggestions quick-access button.
 * Hidden on /whats-new, /suggestions, and /admin routes.
 */
export default function WhatsNewFab() {
  const pathname = usePathname();
  if (pathname === "/whats-new" || pathname === "/suggestions" || pathname.startsWith("/admin")) return null;

  return (
    <div className="pointer-events-none fixed bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))+4.5rem)] right-[max(1.25rem,env(safe-area-inset-right))] z-40 flex flex-col items-center gap-2 md:bottom-[calc(2rem+5rem)] md:right-8">
      <m.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.32, duration: 0.55, delay: 0.05 }}
      >
        <Link
          href="/suggestions"
          aria-label="Suggested websites"
          className={cn(
            "pointer-events-auto group relative flex size-12 items-center justify-center rounded-2xl md:h-[3.25rem] md:w-[3.25rem]",
            "bg-background/85 backdrop-blur-xl",
            "border border-sky-400/35 text-sky-500",
            "shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_10px_40px_-10px_rgba(56,189,248,0.25),0_8px_24px_-8px_rgba(0,0,0,0.55)]",
            "transition-[transform,box-shadow,border-color,background-color] duration-300",
            "hover:-translate-y-0.5 hover:border-sky-400/55 hover:bg-sky-500/12",
            "hover:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_14px_48px_-8px_rgba(56,189,248,0.35),0_12px_32px_-10px_rgba(0,0,0,0.6)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:translate-y-0 active:scale-[0.98]",
          )}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/25 via-cyan-500/15 to-transparent opacity-70"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-sky-400/50 via-cyan-400/25 to-sky-400/30 opacity-40 blur-[1px] transition-opacity duration-300 group-hover:opacity-80"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-sky-400/20 group-hover:ring-sky-400/40"
            aria-hidden
          />
          <Globe
            className="relative z-10 size-6 shrink-0 drop-shadow-[0_0_12px_rgba(56,189,248,0.4)] transition-transform duration-300 group-hover:scale-110"
            strokeWidth={1.65}
          />
        </Link>
      </m.div>

      <m.div
        initial={{ opacity: 0, scale: 0.88, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.32, duration: 0.55, delay: 0.1 }}
      >
        <Link
          href="/whats-new"
          aria-label="What's new"
          className={cn(
            "pointer-events-auto group relative flex size-14 items-center justify-center rounded-2xl md:h-[3.75rem] md:w-[3.75rem]",
            "bg-background/85 backdrop-blur-xl",
            "border border-amber-400/35 text-amber-500",
            "shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_10px_40px_-10px_rgba(251,191,36,0.35),0_8px_24px_-8px_rgba(0,0,0,0.55)]",
            "transition-[transform,box-shadow,border-color,background-color] duration-300",
            "hover:-translate-y-0.5 hover:border-amber-400/55 hover:bg-amber-500/12",
            "hover:shadow-[0_0_0_1px_rgba(251,191,36,0.35),0_14px_48px_-8px_rgba(251,191,36,0.45),0_12px_32px_-10px_rgba(0,0,0,0.6)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:translate-y-0 active:scale-[0.98]",
          )}
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-transparent opacity-70"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-400/50 via-yellow-400/25 to-amber-400/30 opacity-40 blur-[1px] transition-opacity duration-300 group-hover:opacity-80"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-400/20 group-hover:ring-amber-400/40"
            aria-hidden
          />
          <Sparkles
            className="relative z-10 size-7 shrink-0 drop-shadow-[0_0_14px_rgba(251,191,36,0.45)] transition-transform duration-300 group-hover:scale-110 md:h-8 md:w-8"
            strokeWidth={1.65}
          />
        </Link>
      </m.div>
    </div>
  );
}

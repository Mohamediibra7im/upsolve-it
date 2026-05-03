"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Global entry to the help center (fixed bottom-right so it never fights the nav).
 */
export default function HelpFab() {
  const pathname = usePathname();
  if (pathname === "/help") return null;

  return (
    <motion.div
      className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 md:bottom-8 md:right-8"
      initial={{ opacity: 0, scale: 0.88, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.32, duration: 0.55 }}
    >
      <Link
        href="/help"
        aria-label="Open help center"
        className={cn(
          "pointer-events-auto group relative flex h-14 w-14 items-center justify-center rounded-2xl md:h-[3.75rem] md:w-[3.75rem]",
          "bg-background/85 backdrop-blur-xl",
          "border border-primary/35 text-primary",
          "shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_10px_40px_-10px_rgba(16,185,129,0.35),0_8px_24px_-8px_rgba(0,0,0,0.55)]",
          "transition-[transform,box-shadow,border-color,background-color] duration-300",
          "hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/12",
          "hover:shadow-[0_0_0_1px_rgba(16,185,129,0.35),0_14px_48px_-8px_rgba(16,185,129,0.45),0_12px_32px_-10px_rgba(0,0,0,0.6)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "active:translate-y-0 active:scale-[0.98]",
        )}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/25 via-emerald-500/15 to-transparent opacity-70"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/50 via-emerald-400/25 to-primary/30 opacity-40 blur-[1px] transition-opacity duration-300 group-hover:opacity-80"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/20 group-hover:ring-primary/40"
          aria-hidden
        />
        <HelpCircle
          className="relative z-10 h-7 w-7 shrink-0 drop-shadow-[0_0_14px_rgba(52,211,153,0.45)] transition-transform duration-300 group-hover:scale-110 md:h-8 md:w-8"
          strokeWidth={1.65}
        />
      </Link>
    </motion.div>
  );
}

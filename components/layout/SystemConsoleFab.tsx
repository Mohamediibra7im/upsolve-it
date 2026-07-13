"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m as motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Bell, Lightbulb, Cpu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SystemConsoleFab() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu on navigation
  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const showHelp = pathname !== "/help";
  const showWhatsNew = pathname !== "/whats-new";
  const showSuggestions = pathname !== "/suggestions";

  // If no buttons need to be displayed, hide the FAB entirely
  if (!showHelp && !showWhatsNew && !showSuggestions) return null;

  const itemVariants = {
    hidden: { opacity: 0, x: 15, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 350, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      x: 10, 
      scale: 0.9,
      transition: { duration: 0.12 }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 flex items-center gap-2 font-mono pointer-events-none"
    >
      <div className="flex items-center gap-2 pointer-events-auto">
        <AnimatePresence>
          {expanded && (
            <div className="flex items-center gap-2">
              {showHelp && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    href="/help"
                    aria-label="Help manual"
                    className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-sm border border-emerald-500/25 bg-[#060a08]/90 text-emerald-450 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                  >
                    <HelpCircle size={10} className="shrink-0" />
                    <span>HELP</span>
                  </Link>
                </motion.div>
              )}

              {showWhatsNew && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    href="/whats-new"
                    aria-label="What's new changelog"
                    className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-sm border border-amber-500/25 bg-[#060a08]/90 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                  >
                    <Bell size={10} className="shrink-0" />
                    <span>NEWS</span>
                  </Link>
                </motion.div>
              )}

              {showSuggestions && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link
                    href="/suggestions"
                    aria-label="Suggested resources"
                    className="h-9 px-3 flex items-center justify-center gap-1.5 rounded-sm border border-sky-400/25 bg-[#060a08]/90 text-sky-400 hover:bg-sky-500/10 hover:border-sky-405/50 text-[9px] font-bold uppercase tracking-widest shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                  >
                    <Lightbulb size={10} className="shrink-0" />
                    <span>SUGG</span>
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle system control console"
          className={cn(
            "size-10 flex items-center justify-center rounded-sm border transition-all shadow-[0_4px_12px_rgba(0,0,0,0.6)]",
            expanded
              ? "border-red-500/30 text-red-400 bg-red-950/10 hover:bg-red-500/10 hover:border-red-500/50"
              : "border-emerald-500/25 text-emerald-450 bg-[#060a08]/95 hover:bg-emerald-500/10 hover:border-emerald-500/40"
          )}
        >
          {expanded ? (
            <X size={13} className="shrink-0" />
          ) : (
            <Cpu size={14} className="shrink-0 text-emerald-400 animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpsolvedProblems } from "@/hooks/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/Toast";
import { Lightbulb, ShieldAlert, Cpu } from "lucide-react";
import { usePathname } from "next/navigation";
import { m } from "framer-motion";
const SNOOZE_STORAGE_KEY = "training-tracker-upsolve-snoozed";

const UpsolveReminder = () => {
  const { upsolvedProblems, deleteUpsolvedProblem, isLoading } = useUpsolvedProblems();
  const { toast } = useToast();
  const [snoozed, setSnoozed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (globalThis.window === undefined) return;
    try {
      if (globalThis.sessionStorage === undefined) return;
      const val = globalThis.sessionStorage.getItem(SNOOZE_STORAGE_KEY);
      setSnoozed(val === "1");
    } catch (err) {
      console.error("Failed to read snooze from sessionStorage", err);
      setSnoozed(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (globalThis.window !== undefined && globalThis.sessionStorage !== undefined) {
        globalThis.sessionStorage.removeItem(SNOOZE_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
    setSnoozed(false);
  }, [pathname]);

  const firstUnsolved = useMemo(() => {
    if (!upsolvedProblems || upsolvedProblems.length === 0) return null;
    return upsolvedProblems.find((p) => !p.solvedTime) ?? null;
  }, [upsolvedProblems]);

  if (isLoading || snoozed || !firstUnsolved) return null;

  const onUpsolveNow = () => {
    if (!firstUnsolved) return;
    const win = window.open(firstUnsolved.url, "_blank");
    if (win) {
      toast({
        title: "Upsolving...",
        description: `Problem ${firstUnsolved.contestId}-${firstUnsolved.index} launched.`,
        variant: "default",
      });
    }
  };

  const onLater = () => {
    try {
      if (globalThis.window !== undefined && globalThis.sessionStorage !== undefined) {
        globalThis.sessionStorage.setItem(SNOOZE_STORAGE_KEY, "1");
      }
      setSnoozed(true);
      toast({
        title: "Snoozed",
        description: "Reminder hidden for this session.",
      });
    } catch {
      setSnoozed(true);
    }
  };

  const onGiveUp = async () => {
    if (!firstUnsolved) return;
    try {
      await deleteUpsolvedProblem(firstUnsolved);
      toast({
        title: "Problem Removed",
        description: "Successfully cleared from your upsolve list.",
        variant: "destructive",
      });
    } catch {
      // no-op
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full font-mono text-amber-400 select-none"
    >
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-[#080705] shadow-[0_0_20px_rgba(245,158,11,0.03)]">
        {/* Scanline CRT overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.08]" />
        
        {/* Cockpit Shell Top Status Header */}
        <div className="flex flex-wrap items-center justify-between px-6 py-2.5 border-b border-amber-500/15 bg-[#14100b] text-[9px] text-amber-500/40">
          <div className="flex items-center gap-2">
            <ShieldAlert size={12} className="text-amber-400 animate-pulse" />
            <span className="font-bold tracking-wider">COGNITIVE_PROMPT // UNRESOLVED_DEPENDENCY</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={10} className="text-amber-500/30" />
            <span>INTERCEPT: ACTIVE</span>
          </div>
        </div>

        {/* Viewport Screen Content */}
        <div className="p-6 relative z-10 bg-[#080705]/95 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="size-10 shrink-0 rounded border border-amber-500/20 bg-amber-950/10 flex items-center justify-center text-amber-400">
              <Lightbulb size={18} className="animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/40">system_recommendation</span>
              <h4 className="text-sm font-bold text-amber-300">
                Unsolved Challenge Node Detected: {firstUnsolved.contestId}-{firstUnsolved.index}
              </h4>
              <p className="text-[11px] leading-relaxed text-amber-500/60 max-w-2xl">
                We recommend resolving previous unsolved problem blocks before compiling a new contest simulation.
                Do you want to compile <span className="font-bold text-amber-300 underline underline-offset-4">{firstUnsolved.contestId}-{firstUnsolved.index}</span> now?
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            <Button
              onClick={onUpsolveNow}
              className="w-full sm:w-auto h-10 rounded bg-amber-500 text-amber-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] active:scale-[0.98] transition-all font-mono"
            >
              [ UPSOLVE_NOW.EXE ]
            </Button>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              <Button
                variant="outline"
                onClick={onLater}
                className="h-10 px-4 rounded border border-amber-500/35 bg-transparent text-amber-400 font-bold uppercase tracking-widest text-[9px] hover:bg-amber-500/10 hover:text-amber-300 hover:border-amber-500/60 active:scale-[0.98] transition-all font-mono"
              >
                [ SNOOZE.SH ]
              </Button>
              <div className="h-4 w-px bg-amber-500/15" />
              <Button
                variant="outline"
                onClick={onGiveUp}
                className="h-10 px-4 rounded border border-red-500/35 bg-transparent text-red-400 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 active:scale-[0.98] transition-all font-mono"
              >
                [ PURGE_NODE.SH ]
              </Button>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default UpsolveReminder;

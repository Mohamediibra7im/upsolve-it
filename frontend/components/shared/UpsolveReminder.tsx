"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpsolvedProblems } from "@/hooks/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/Toast";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { usePathname } from "next/navigation";

const SNOOZE_STORAGE_KEY = "training-tracker-upsolve-snoozed";

const UpsolveReminder = () => {
  const { upsolvedProblems, deleteUpsolvedProblem, isLoading } =
    useUpsolvedProblems();
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
      if (
        globalThis.window !== undefined &&
        globalThis.sessionStorage !== undefined
      ) {
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
      if (
        globalThis.window !== undefined &&
        globalThis.sessionStorage !== undefined
      ) {
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
    <aside className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-card p-5 font-sans lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <RotateCcw size={18} />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium text-primary">
            A problem worth another try
          </p>
          <h3 className="text-base font-medium text-foreground">
            {firstUnsolved.name ||
              `${firstUnsolved.contestId}-${firstUnsolved.index}`}
          </h3>
          <p className="mt-2 max-w-xl text-xs leading-6 text-muted-foreground">
            Revisit this unsolved problem before your next session. A fresh
            perspective can make all the difference.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button onClick={onUpsolveNow} className="h-10 rounded-xl text-xs">
          Solve this problem <ArrowUpRight size={15} />
        </Button>
        <Button
          variant="outline"
          onClick={onLater}
          className="h-10 rounded-xl text-xs"
        >
          Later
        </Button>
        <Button
          variant="ghost"
          onClick={onGiveUp}
          className="h-10 rounded-xl text-xs text-muted-foreground hover:text-destructive"
        >
          Dismiss
        </Button>
      </div>
    </aside>
  );
};

export default UpsolveReminder;

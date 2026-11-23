"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpsolvedProblems } from "@/hooks/data";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/Toast";
import { ArrowUpRight } from "lucide-react";
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
        title: "Opened on Codeforces",
        description: `Problem ${firstUnsolved.contestId}${firstUnsolved.index} is in a new tab.`,
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
        title: "Reminder hidden",
        description: "It comes back when you open another page.",
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
        title: "Removed from your upsolve queue",
        variant: "success",
        description: "It will not come back on the next sync.",
      });
    } catch {
      // no-op
    }
  };

  return (
    <aside
      aria-label="Upsolve reminder"
      className="u-panel flex flex-wrap items-center justify-between gap-4 px-5 py-4"
    >
      <div className="min-w-0">
        <p className="t-eyebrow">A problem worth another try</p>
        <h3 className="t-h3 mt-1 truncate">
          {firstUnsolved.name ||
            `${firstUnsolved.contestId}-${firstUnsolved.index}`}
        </h3>
        <p className="t-sm t-muted">
          Revisit it before your next session. A fresh look can make all the
          difference.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={onUpsolveNow}>
          Solve this problem <ArrowUpRight aria-hidden="true" />
        </Button>
        <Button variant="ghost" onClick={onLater}>
          Later
        </Button>
        <Button variant="ghost" onClick={onGiveUp}>
          Remove from queue
        </Button>
      </div>
    </aside>
  );
};

export default UpsolveReminder;

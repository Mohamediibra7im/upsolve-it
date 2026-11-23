"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import * as Popover from "@radix-ui/react-popover";
import { Bell, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHead } from "@/components/ui/kit";
import { useToast } from "@/components/providers/Toast";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ReminderSettings from "@/components/features/profile/ReminderSettings";
import { UpsolveRounds, buildRounds } from "@/components/features/upsolve";
import { useUser } from "@/hooks/auth";
import { useHistory, useUpsolvedProblems } from "@/hooks/data";
import { swrFetcher } from "@/lib/apiClient";
import type { TrainingProblem } from "@/types/TrainingProblem";

/** The weekly email, behind one button that says whether it is on. */
function ReminderButton() {
  // The same key ReminderSettings reads, so the label follows what it saves.
  const { data } = useSWR<{ email: string | null; verified: boolean }>(
    "/api/reminders",
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const state = !data?.email ? "off" : data.verified ? "weekly" : "confirm it";
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline">
          <Bell aria-hidden="true" />
          Reminder: {state}
          <ChevronDown aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="u-panel u-panel--pop z-[60] grid w-[26rem] max-w-[calc(100vw-1.5rem)] gap-3 p-5"
        >
          <h2 className="t-h3 text-ink">Weekly reminder</h2>
          <p className="t-sm t-muted">
            One email a week listing the problems still waiting in your upsolve
            queue. Nothing is sent when the queue is clear.
          </p>
          <ReminderSettings />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export default function UpsolvePage() {
  const { user } = useUser();
  const { history, isLoading: isHistoryLoading } = useHistory();
  const {
    upsolvedProblems,
    isLoading,
    error,
    refreshUpsolvedProblems,
    deleteUpsolvedProblem,
    syncWithCodeforces,
    syncWithHistory,
  } = useUpsolvedProblems();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasAutoSynced, setHasAutoSynced] = useState(false);
  // Kept apart from the open flag so the problem stays visible while the dialog closes.
  const [problemToDelete, setProblemToDelete] =
    useState<TrainingProblem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pull failed contest problems and solved status from Codeforces once per visit.
  const userId = user?._id;
  const syncedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!userId || syncedFor.current === userId) return;
    syncedFor.current = userId;
    syncWithCodeforces().catch(() => {});
  }, [userId, syncWithCodeforces]);

  useEffect(() => {
    // Wait for the queue itself: compared with an empty list, every unsolved
    // problem in the history would look missing and be added again.
    if (!hasAutoSynced && !isLoading && !error && history.length > 0) {
      syncWithHistory(history);
      setHasAutoSynced(true);
    }
  }, [history, isLoading, error, syncWithHistory, hasAutoSynced]);

  const rounds = useMemo(
    () => buildRounds(upsolvedProblems, history),
    [upsolvedProblems, history],
  );

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const { added, solved } = await syncWithCodeforces();
      toast({
        title: "Synced with Codeforces",
        description: `${added} added from recent contests, ${solved} marked solved.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Sync failed",
        description: "Codeforces did not answer. Try again in a minute.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) return null;

  const total = upsolvedProblems.length;

  return (
    <>
      <PageHead
        eyebrow="The upsolve queue"
        title="Finish what each round started."
      >
        <ReminderButton />
        <Button onClick={handleSync} disabled={isSyncing}>
          <RefreshCw
            aria-hidden="true"
            className={
              isSyncing ? "animate-spin motion-reduce:animate-none" : undefined
            }
          />
          {isSyncing ? "Syncing…" : "Sync with Codeforces"}
        </Button>
      </PageHead>

      {isLoading || isHistoryLoading ? (
        <div
          role="status"
          aria-label="Loading your upsolve queue"
          className="grid animate-pulse gap-6 motion-reduce:animate-none lg:grid-cols-12"
        >
          <div className="u-panel h-16 lg:col-span-12" />
          <div className="u-panel h-72 lg:col-span-6" />
          <div className="u-panel h-72 lg:col-span-6" />
        </div>
      ) : error && total === 0 ? (
        <div role="alert" className="grid justify-items-start gap-3">
          <p>
            Your upsolve queue did not load. Check your connection and try
            again.
          </p>
          <Button variant="outline" onClick={() => refreshUpsolvedProblems()}>
            Try again
          </Button>
        </div>
      ) : total > 0 ? (
        <UpsolveRounds
          rounds={rounds}
          onDelete={(problem) => {
            setProblemToDelete(problem);
            setIsConfirmOpen(true);
          }}
        />
      ) : (
        <EmptyState
          title="You’re all caught up."
          action={
            <Link href="/training" className="u-btn">
              Start a training session
            </Link>
          }
        >
          Problems you miss in sessions and contests land here on their own.
          Nothing is waiting right now.
        </EmptyState>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => !isDeleting && setIsConfirmOpen(false)}
        onConfirm={async () => {
          if (!problemToDelete) return;
          setIsDeleting(true);
          try {
            await deleteUpsolvedProblem(problemToDelete);
            setIsConfirmOpen(false);
          } finally {
            setIsDeleting(false);
          }
        }}
        problem={problemToDelete}
        isLoading={isDeleting}
      />
    </>
  );
}

"use client";

import MemberPageState from "@/components/features/profile/MemberPageState";

import StudioMascot from "@/components/shared/StudioMascot";
import StudioProgress from "@/components/features/profile/StudioProgress";

import { TrainingProblem } from "@/types/TrainingProblem";
import { useUpsolvedProblems, useHistory } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import { UpsolvedProblemsList } from "@/components/features/upsolve";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Target,
  CheckCircle2,
  Clock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { m } from "framer-motion";
import Link from "next/link";

export default function UpsolvePage() {
  const { user, isLoading: isUserLoading } = useUser();
  const { history, isLoading: isHistoryLoading } = useHistory();
  const {
    upsolvedProblems,
    isLoading,
    error,
    refreshUpsolvedProblems,
    deleteUpsolvedProblem,
    onRefreshUpsolvedProblems,
    syncWithHistory,
  } = useUpsolvedProblems();

  const [hasAutoSynced, setHasAutoSynced] = useState(false);

  useEffect(() => {
    if (!hasAutoSynced && history && history.length > 0 && upsolvedProblems) {
      syncWithHistory(history);
      setHasAutoSynced(true);
    }
  }, [history, upsolvedProblems, syncWithHistory, hasAutoSynced]);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState<TrainingProblem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(() => {
    if (!upsolvedProblems || upsolvedProblems.length === 0) {
      return { total: 0, solved: 0, pending: 0, solvingRate: 0 };
    }
    const total = upsolvedProblems.length;
    const solved = upsolvedProblems.filter(p => p.solvedTime).length;
    return {
      total,
      solved,
      pending: total - solved,
      solvingRate: total > 0 ? Math.round((solved / total) * 100) : 0,
    };
  }, [upsolvedProblems]);

  if (isLoading || isUserLoading || isHistoryLoading) return <MemberPageState kind="loading" title="Gathering your next opportunities" description="Loading the problems you’re ready to revisit." />;
  if (!user) return <MemberPageState title="Your progress belongs here" description="Log in to revisit your unsolved problems and keep making progress."><Button asChild><Link href="/login">Log in</Link></Button></MemberPageState>;
  if (error && upsolvedProblems.length === 0) return <MemberPageState kind="error" title="Your upsolve list is unavailable" description="We couldn’t load your saved problems. Try again in a moment."><Button variant="outline" onClick={() => refreshUpsolvedProblems()}>Try again</Button></MemberPageState>;

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 font-sans text-foreground">

      <section className="mx-auto w-full py-8 lg:py-12 space-y-8 max-w-7xl">

        <m.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target size={12} className="text-primary" />
            <span>Your upsolve list</span>
            <span className="flex-1 border-b border-border" />
            <span>Active</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                Come back stronger.
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Revisit the problems that challenged you. Take your time, try a new approach, and turn each attempt into progress.
              </p>
            </div>

            <Button
              onClick={() => onRefreshUpsolvedProblems(history)}
              className="h-10 px-6 rounded-lg border border-border bg-transparent text-primary font-medium text-xs hover:bg-primary/10 hover:text-foreground hover:border-border active:scale-[0.98] transition-all font-sans shrink-0"
              variant="outline"
            >
              <RefreshCw size={12} className="mr-2" />
              Refresh status
            </Button>
          </div>
        </m.div>

        {upsolvedProblems && upsolvedProblems.length > 0 ? (
          <div className="space-y-8">

            <m.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-medium text-muted-foreground">Total problems</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-medium text-foreground tabular-nums">{stats.total}</span>
                  <span className="text-xs text-muted-foreground">problems</span>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-medium text-muted-foreground">Solved</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-medium text-foreground tabular-nums">{stats.solved}</span>
                  <CheckCircle2 size={12} className="text-primary" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-medium text-amber-300">Pending</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-medium text-amber-400 tabular-nums">{stats.pending}</span>
                  <Clock size={12} className="text-amber-300" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <span className="text-xs font-medium text-muted-foreground">Solve rate</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-medium text-foreground tabular-nums">{stats.solvingRate}%</span>
                  <StudioProgress value={stats.solvingRate} label="Upsolve completion" className="max-w-20" />
                </div>
              </div>
            </m.div>

            {/* Target List Section Header */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pt-4">
              <Trophy size={12} className="text-primary" />
              <span>Practice problems</span>
              <span className="flex-1 border-b border-border" />
            </div>

            {/* Problems List */}
            <m.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <UpsolvedProblemsList
                upsolvedProblems={upsolvedProblems}
                onDelete={(problem: TrainingProblem) => {
                  setProblemToDelete(problem);
                  setShowConfirmDialog(true);
                }}
              />
            </m.div>
          </div>
        ) : (
          <m.div
            initial={false}
            animate={{ opacity: 1 }}
            className="py-16 text-center space-y-6"
          >
            <StudioMascot pose="rest" className="mx-auto w-36" />
            <div className="space-y-2">
              <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">You’re all caught up.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                You’re all caught up. Start a fresh session and find your next challenge.
              </p>
            </div>
            <Button asChild className="h-10 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans">
              <Link href="/training">
                Start a session
                <ArrowRight size={12} className="ml-2" />
              </Link>
            </Button>
          </m.div>
        )}
      </section>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => !isDeleting && setShowConfirmDialog(false)}
        onConfirm={async () => {
          if (!problemToDelete) return;
          setIsDeleting(true);
          try {
            await deleteUpsolvedProblem(problemToDelete);
            setShowConfirmDialog(false);
          } finally {
            setIsDeleting(false);
          }
        }}
        problem={problemToDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

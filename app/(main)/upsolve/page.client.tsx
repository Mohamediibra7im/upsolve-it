"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import { useUpsolvedProblems, useHistory } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
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
  Lock,
  Cpu,
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

  if (isLoading || isUserLoading || isHistoryLoading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center font-mono">
        <div className="relative overflow-hidden rounded-lg border border-red-500/25 bg-[#0a0606] p-8 max-w-md w-full mx-4 text-center space-y-5">
          <div className="absolute inset-0 pointer-events-none bg-terminal-scanlines opacity-[0.06]" />
          <div className="size-14 rounded border border-red-500/20 bg-red-950/10 flex items-center justify-center text-red-400 mx-auto">
            <Lock size={24} />
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-red-300 uppercase tracking-wider">Access Denied</h2>
            <p className="text-[11px] text-red-500/50">Authentication required. Sign in to access your upsolve queue terminal.</p>
          </div>
          <Button asChild className="w-full h-10 rounded bg-red-600 text-red-50 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500 transition-all font-mono">
            <Link href="/">[ AUTHENTICATE.SH ]</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Block progress bar
  const totalBlocks = 20;
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((stats.solvingRate / 100) * totalBlocks)));
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 font-mono text-emerald-400">
      {/* Terminal Background */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 max-w-7xl">
        {/* Terminal Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Target size={12} className="text-emerald-400" />
            <span>UPSOLVE_QUEUE // UNRESOLVED_CHALLENGE_NODES</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>SYS.ACTIVE</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Upsolve Queue Terminal
              </h1>
              <p className="text-[11px] text-emerald-500/50 max-w-2xl leading-relaxed">
                Resolve unfinished problem nodes from previous training sessions. Track your progress and eliminate pending challenges.
              </p>
            </div>

            <Button
              onClick={() => onRefreshUpsolvedProblems(history)}
              className="h-10 px-6 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/50 active:scale-[0.98] transition-all font-mono shrink-0"
              variant="outline"
            >
              <RefreshCw size={12} className="mr-2" />
              [ SYNC_STATUS.SH ]
            </Button>
          </div>
        </m.div>

        {upsolvedProblems && upsolvedProblems.length > 0 ? (
          <div className="space-y-8">
            {/* Telemetry Readouts */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="py-3 px-4 border-b border-emerald-500/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">QUEUE.TOTAL</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-300 tabular-nums">{stats.total}</span>
                  <span className="text-[9px] text-emerald-500/30">nodes</span>
                </div>
              </div>
              <div className="py-3 px-4 border-b border-emerald-500/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">RESOLVED.COUNT</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-300 tabular-nums">{stats.solved}</span>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                </div>
              </div>
              <div className="py-3 px-4 border-b border-emerald-500/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500/40">PENDING.COUNT</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-amber-400 tabular-nums">{stats.pending}</span>
                  <Clock size={12} className="text-amber-500/60" />
                </div>
              </div>
              <div className="py-3 px-4 border-b border-emerald-500/10">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">RESOLVE.RATE</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-bold text-emerald-300 tabular-nums">{stats.solvingRate}%</span>
                  <span className="text-[10px] text-emerald-500/30 hidden sm:inline">[{progressBar}]</span>
                </div>
              </div>
            </m.div>

            {/* Target List Section Header */}
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40 pt-4">
              <Trophy size={12} className="text-emerald-400" />
              <span>TARGET_LIST // PROBLEM_REGISTRY</span>
              <span className="flex-1 border-b border-emerald-500/10" />
            </div>

            {/* Problems List */}
            <m.div
              initial={{ opacity: 0 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center space-y-6"
          >
            <div className="size-14 rounded border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 mx-auto">
              <Trophy size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">Queue Empty — All Nodes Resolved</h3>
              <p className="text-[11px] text-emerald-500/40 max-w-sm mx-auto">
                No pending upsolve challenges. Start a new training session to generate challenge nodes.
              </p>
            </div>
            <Button asChild className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all font-mono">
              <Link href="/training">
                [ START_NEW_SESSION.EXE ]
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

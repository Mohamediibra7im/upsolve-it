"use client";

import { TrainingProblem } from "@/types/TrainingProblem";
import { useUpsolvedProblems, useHistory } from "@/hooks/data";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { UpsolvedProblemsList } from "@/components/features/upsolve";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  Lock
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <Card className={cn(
    "relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl group",
    color === "sky" && "hover:shadow-sky-500/10",
    color === "emerald" && "hover:shadow-emerald-500/10",
    color === "amber" && "hover:shadow-amber-500/10"
  )}>
    <div className={cn(
      "absolute -right-8 -top-8 size-32 opacity-[0.03] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.06]",
      color === "sky" && "text-sky-500",
      color === "emerald" && "text-emerald-500",
      color === "amber" && "text-amber-500"
    )}>
      <Icon className="size-full" />
    </div>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2.5 rounded-xl border",
          color === "sky" && "bg-sky-500/10 border-sky-500/20 text-sky-500",
          color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
          color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-500"
        )}>
          <Icon className="size-5" />
        </div>
        {subtitle && (
          <Badge variant="outline" className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            color === "emerald" && "border-emerald-500/30 text-emerald-500"
          )}>
            {subtitle}
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{title}</p>
        <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
      </div>
    </CardContent>
  </Card>
);

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

  // Auto-sync missing problems from history on first load
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto border border-primary/20">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Access Restricted</h2>
              <p className="text-sm text-muted-foreground font-medium">Please sign in to view and manage your personal upsolve challenge.</p>
            </div>
            <Button asChild className="w-full h-12 font-black uppercase tracking-widest text-xs rounded-xl">
              <Link href="/">Return to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] size-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] size-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12 max-w-7xl">
        {/* Hero Section */}
        <m.div 
          className="relative rounded-[2.5rem] border border-border/40 bg-card/20 backdrop-blur-2xl overflow-hidden p-8 sm:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Target size={240} />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                <Flame className="size-4 text-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Persistence Required</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-[0.95]">
                  Upsolve <span className="text-primary">Challenge</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl opacity-80">
                  Conquer the problems that pushed your limits. This is your personal arena to transform past mistakes into future expertise.
                </p>
              </div>
            </div>

            <Button
              onClick={() => onRefreshUpsolvedProblems(history)}
              className="h-14 px-8 rounded-2xl bg-background border border-border/40 hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all shadow-xl font-black uppercase tracking-widest text-xs group"
            >
              <RefreshCw className="size-4 mr-3 group-hover:rotate-180 transition-transform duration-500" />
              Sync Status
            </Button>
          </div>
        </m.div>

        {upsolvedProblems && upsolvedProblems.length > 0 ? (
          <div className="space-y-16">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                title="Total Queue" 
                value={stats.total} 
                icon={BookOpen} 
                color="sky" 
              />
              <StatCard 
                title="Conquered" 
                value={stats.solved} 
                icon={CheckCircle2} 
                color="emerald" 
                subtitle={`${stats.solvingRate}% Success`}
              />
              <StatCard 
                title="In Progress" 
                value={stats.pending} 
                icon={Clock} 
                color="amber" 
              />
            </div>

            {/* Main List Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent border border-accent/20">
                    <Trophy className="size-5" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Target List</h2>
                </div>
              </div>

              <m.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 sm:py-32">
            <m.div 
              className="relative p-12 bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[3rem] shadow-2xl text-center max-w-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="absolute inset-0 bg-emerald-500/5 rounded-[3rem] blur-3xl -z-10 animate-pulse" />
              <div className="space-y-8">
                <div className="p-8 bg-emerald-500/10 rounded-full w-fit mx-auto border border-emerald-500/20 text-emerald-500">
                  <Trophy className="size-16" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-foreground tracking-tight">Arena Cleared.</h3>
                  <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                    Your upsolve list is empty. You've conquered every challenge. Outstanding work!
                  </p>
                </div>
                <Button asChild size="lg" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10">
                  <Link href="/training">
                    Start New Session
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </m.div>
          </div>
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








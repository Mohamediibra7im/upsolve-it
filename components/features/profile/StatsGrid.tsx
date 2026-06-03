"use client";

import Link from "next/link";
import { m } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";

interface StatsGridProps {
  profileStats: Array<{
    label: string;
    value: string | number;
    sub: string;
    icon: any;
    tone: string;
  }>;
  trainingStats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    avgPerformance: number | null;
    bestPerformance: number | null;
    solvingRate: number;
  } | null;
  recentSessions: any[];
}

export default function StatsGrid({ profileStats, trainingStats, recentSessions }: StatsGridProps) {
  return (
    <div className="xl:col-span-8 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {profileStats.map((stat, idx) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full flex flex-col justify-between">
              <stat.icon
                className={cn(
                  "absolute -top-3 -right-3 size-14 opacity-5 group-hover:opacity-10 transition-opacity",
                  stat.tone,
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                {stat.label}
              </span>
              <div className="mt-4 space-y-1">
                <h3 className="text-3xl font-[1000] tracking-tight text-foreground">{stat.value}</h3>
                <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide">{stat.sub}</p>
              </div>
            </Card>
          </m.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
            <BarChart3 className="absolute -top-3 -right-3 size-14 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Sessions</span>
            <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.totalSessions ?? 0}</h3>
            <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Total completed</p>
          </Card>
        </m.div>
        <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
            <CheckCircle2 className="absolute -top-3 -right-3 size-14 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Solved</span>
            <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">
              {trainingStats?.solvedProblems ?? 0}
              <span className="text-sm font-bold text-muted-foreground/50 ml-1">/ {trainingStats?.totalProblems ?? 0}</span>
            </h3>
            <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">{trainingStats?.solvingRate ?? 0}% rate</p>
          </Card>
        </m.div>
        <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
            <TrendingUp className="absolute -top-3 -right-3 size-14 opacity-5 group-hover:opacity-10 transition-opacity text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Avg Perf</span>
            <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.avgPerformance ?? "—"}</h3>
            <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Rating performance</p>
          </Card>
        </m.div>
        <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border/60 dark:border-border/40 bg-card/25 hover:bg-card/45 backdrop-blur-xl rounded-2xl p-5 hover:border-primary/25 transition-all duration-300 group overflow-hidden relative h-full">
            <Sparkles className="absolute -top-3 -right-3 size-14 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">Best Perf</span>
            <h3 className="text-2xl font-[1000] tracking-tight text-foreground mt-3">{trainingStats?.bestPerformance ?? "—"}</h3>
            <p className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-wide mt-0.5">Personal record</p>
          </Card>
        </m.div>
      </div>

      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                Recent Activity
              </span>
            </div>
            <Link
              href="/statistics"
              className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/20">
            {recentSessions.length > 0 ? recentSessions.map((session) => {
              const solved = session.problems.filter(isTrainingProblemCountedSolved).length;
              const total = session.problems.length;
              const mode = session.trainingMode ?? "training";
              return (
                <div key={session._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "size-2 rounded-full shrink-0",
                      solved > 0 ? "bg-emerald-500" : "bg-muted-foreground/30"
                    )} />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-foreground capitalize truncate block">
                        {mode} Session
                      </span>
                      <span className="text-[9px] text-muted-foreground/60 font-medium">
                        {new Date(session.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground/70 tabular-nums">
                      {solved}/{total}
                    </span>
                    <span className="text-[10px] font-black text-primary tabular-nums w-12 text-right">
                      {session.performance ?? "—"}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="px-5 py-8 text-center">
                <p className="text-xs text-muted-foreground/50 font-medium">No practice sessions yet.</p>
                <Button asChild variant="outline" className="mt-3 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest">
                  <Link href="/training">Start Your First Session</Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </m.div>
    </div>
  );
}

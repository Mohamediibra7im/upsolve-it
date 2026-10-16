"use client";

import Link from "next/link";
import { m } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isTrainingProblemCountedSolved } from "@/services/training/problemCountedSolved";

interface ProfileStatsGridProps {
  profileStats: Array<{
    label: string;
    value: string | number;
    sub: string;
    icon: any;
    tone: string;
  }>;
}

export function ProfileStatsGrid({ profileStats }: ProfileStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 font-sans text-foreground w-full">
      {profileStats.map((stat, idx) => (
        <m.div
          key={stat.label}
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="min-w-0"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:border-border group flex flex-col justify-between h-full">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground block">
                {stat.label}
              </span>
              <h3 className={cn("font-heading text-2xl font-medium tracking-tight leading-none tabular-nums", stat.tone)}>
                {stat.value}
              </h3>
              <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border mt-2">
                {stat.sub}
              </p>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}

interface TrainingStatsGridProps {
  trainingStats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    avgPerformance: number | null;
    bestPerformance: number | null;
    solvingRate: number;
  } | null;
}

export function TrainingStatsGrid({ trainingStats }: TrainingStatsGridProps) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 font-sans text-primary w-full">
      <m.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:border-border group h-full">
          <span className="text-xs font-medium text-muted-foreground block">Sessions</span>
          <h3 className="text-2xl font-medium text-foreground leading-none mt-2 font-heading tracking-tight">
            {trainingStats?.totalSessions ?? 0}
          </h3>
          <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border mt-2">
            Training sessions
          </p>
        </div>
      </m.div>

      <m.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:border-border group h-full">
          <span className="text-xs font-medium text-muted-foreground block">Solved</span>
          <h3 className="text-2xl font-medium text-foreground leading-none mt-2 font-heading tracking-tight">
            {trainingStats?.solvedProblems ?? 0}
            <span className="text-xs font-medium text-muted-foreground ml-1">/ {trainingStats?.totalProblems ?? 0}</span>
          </h3>
          <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border mt-2">
            {trainingStats?.solvingRate ?? 0}% solve rate
          </p>
        </div>
      </m.div>

      <m.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:border-border group h-full">
          <span className="text-xs font-medium text-muted-foreground block">Avg. performance</span>
          <h3 className="text-2xl font-medium text-foreground leading-none mt-2 font-heading tracking-tight">
            {trainingStats?.avgPerformance ?? "—"}
          </h3>
          <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border mt-2">
            Average session performance
          </p>
        </div>
      </m.div>

      <m.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 transition-all duration-300 hover:border-border group h-full">
          <span className="text-xs font-medium text-muted-foreground block">Best performance</span>
          <h3 className="text-2xl font-medium text-foreground leading-none mt-2 font-heading tracking-tight">
            {trainingStats?.bestPerformance ?? "—"}
          </h3>
          <p className="text-xs font-medium text-muted-foreground pt-2 border-t border-border mt-2">
            Personal best
          </p>
        </div>
      </m.div>
    </div>
  );
}

interface AchievementsPanelProps {
  achievements: Array<{
    id: string;
    name: string;
    desc: string;
    icon: any;
    unlocked: boolean;
    color: string;
  }>;
}

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  return (
    <div className="font-sans text-primary w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-primary" />
          <span className="font-semibold">Your achievements</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {achievements.filter(a => a.unlocked).length} / {achievements.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <m.div
              key={badge.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div
                className={cn(
                  "flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden min-h-[120px] font-sans",
                  badge.unlocked
                    ? "border-border bg-card hover:border-border"
                    : "border-border bg-transparent border-dashed"
                )}
              >
                <div className="flex items-start justify-between w-full">
                  <div className={cn(
                    "p-2 rounded-lg border relative",
                    badge.unlocked ? "border-border bg-card text-primary" : "bg-transparent border-border text-muted-foreground"
                  )}>
                    <Icon className="size-4" />
                    {badge.unlocked && (
                      <span className="absolute -top-0.5 -right-0.5 flex size-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
                      </span>
                    )}
                  </div>

                  {!badge.unlocked ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      Inactive
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-primary">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className={cn("text-sm font-semibold leading-snug", badge.unlocked ? "text-primary" : "text-muted-foreground")}>
                    {badge.name}
                  </h4>
                  <p className={cn("text-xs mt-1.5 leading-tight font-medium", badge.unlocked ? "text-muted-foreground" : "text-muted-foreground")}>
                    {badge.desc}
                  </p>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

interface ActivityLogsPanelProps {
  recentSessions: any[];
}

export function ActivityLogsPanel({ recentSessions }: ActivityLogsPanelProps) {
  return (
    <div className="font-sans text-primary w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          <span className="font-semibold">Recent practice</span>
        </div>
        <Link
          href="/statistics"
          className="text-xs font-medium text-primary hover:text-foreground flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          View all sessions <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {recentSessions.length > 0 ? recentSessions.map((session) => {
          const solved = session.problems.filter(isTrainingProblemCountedSolved).length;
          const total = session.problems.length;
          const mode = session.trainingMode ?? "training";
          return (
            <div key={session._id ?? session.startTime} className="flex flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium capitalize text-foreground">{mode} session</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(session.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <dl className="grid grid-cols-2 gap-6 text-sm sm:text-right">
                <div><dt className="text-xs text-muted-foreground">Solved</dt><dd className="mt-1 tabular-nums text-foreground">{solved}/{total}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Performance</dt><dd className="mt-1 tabular-nums text-primary">{session.performance ?? "—"}</dd></div>
              </dl>
            </div>
          );
        }) : (
          <div className="px-5 py-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">Your recent sessions will appear here.</p>
            <Button asChild variant="outline" className="h-9 rounded-lg border border-border bg-card text-primary font-medium text-xs hover:bg-primary/10 hover:text-foreground hover:border-border active:scale-[0.98] transition-all font-sans">
              <Link href="/training">Start your first session</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

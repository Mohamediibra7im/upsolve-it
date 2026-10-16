"use client";

import { useRef } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Zap, CheckCircle, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiFetcher } from "@/lib/apiClient";
import { formatAvgProblemRating } from "@/services/training/formatAvgProblemRating";
import StudioProgress from "./StudioProgress";
import MemberPageState from "./MemberPageState";

export interface UserTrainingStatsView {
  user: {
    avatar?: string;
    codeforcesHandle: string;
    rating: number;
    rank: string;
    maxRating: number;
    maxRank: string;
    xp?: number;
    levelsCompleted?: number;
    topicsCompleted?: number;
  };
  stats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    upsolvedCount: number;
    upsolvedSolvedCount: number;
    averagePerformance: number;
    bestPerformance: number;
    worstPerformance: number;
    solvingRate: number;
    averageRating: number;
    recentTrend: number;
    recentSessions: number;
  };
  trainings: Array<{
    id: string;
    startTime: number;
    endTime: number;
    performance: number;
    problemsCount: number;
    solvedCount: number;
  }>;
}

interface UserProfileDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Codeforces rating bands.
const getRankAesthetics = (rating: number) => {
  if (rating === 0) return { text: "text-zinc-400", border: "border-zinc-500/20", bg: "bg-zinc-500/10", label: "Unrated" };
  if (rating < 1200) return { text: "text-zinc-400", border: "border-zinc-500/25", bg: "bg-zinc-500/10", label: "Newbie" };
  if (rating < 1400) return { text: "text-primary", border: "border-border", bg: "bg-primary/10", label: "Pupil" };
  if (rating < 1600) return { text: "text-cyan-400", border: "border-primary/20", bg: "bg-primary/10", label: "Specialist" };
  if (rating < 1900) return { text: "text-blue-400", border: "border-primary/20", bg: "bg-primary/10", label: "Expert" };
  if (rating < 2100) return { text: "text-violet-400", border: "border-violet-500/30", bg: "bg-violet-500/10", label: "Candidate Master" };
  if (rating < 2300) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", label: "Master" };
  if (rating < 2400) return { text: "text-orange-400", border: "border-primary/20", bg: "bg-primary/10", label: "International Master" };
  if (rating < 2600) return { text: "text-rose-500", border: "border-primary/20", bg: "bg-primary/10", label: "Grandmaster" };
  if (rating < 3000) return { text: "text-red-500", border: "border-red-500/30", bg: "bg-red-500/10", label: "International Grandmaster" };
  return { text: "text-red-500 font-semibold", border: "border-red-500/40", bg: "bg-red-500/15", label: "Legendary Grandmaster" };
};

const getXPLevel = (xp: number) => {
  const level = Math.floor(xp / 1000) + 1;
  const nextLevelXp = level * 1000;
  const prevLevelXp = (level - 1) * 1000;
  const progressPercent = Math.min(100, Math.max(0, ((xp - prevLevelXp) / 1000) * 100));

  let title = "Novice";
  if (xp >= 5000) title = "Legend";
  else if (xp >= 3000) title = "Champion";
  else if (xp >= 1500) title = "Strategist";
  else if (xp >= 500) title = "Tactician";

  return { level, nextLevelXp, progressPercent, title };
};

export function UserProfileDialog({
  userId,
  open,
  onOpenChange,
}: Readonly<UserProfileDialogProps>) {
  const openerRef = useRef<HTMLElement | null>(null);
  const { data: userStats, error, isLoading, mutate } = useSWR<UserTrainingStatsView>(
    open && userId ? `/api/roadmap/users/${userId}/stats` : null,
    apiFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const stats = userStats?.stats;
  const user = userStats?.user;
  const xp = user?.xp ?? 0;
  const { level, progressPercent, title: xpTitle } = getXPLevel(xp);
  const aesthetic = getRankAesthetics(user?.rating ?? 0);

  // Compute Achievements (Gamified Badges)
  const achievements = [
    {
      id: "gladiator",
      name: "Gladiator",
      desc: "Complete 5 training sessions",
      icon: Trophy,
      unlocked: (stats?.totalSessions ?? 0) >= 5,
      color: "text-amber-400 border-amber-400/20 bg-amber-400/5",
    },
    {
      id: "marksman",
      name: "Marksman",
      desc: "Maintained a 70%+ solving accuracy",
      icon: Target,
      unlocked: (stats?.solvingRate ?? 0) >= 70,
      color: "text-primary border-border bg-primary/10",
    },
    {
      id: "upsolve-elite",
      name: "Upsolve Elite",
      desc: "Successfully upsolved a target task",
      icon: CheckCircle,
      unlocked: (stats?.upsolvedSolvedCount ?? 0) >= 1,
      color: "text-primary border-border bg-primary/10",
    },
    {
      id: "titan",
      name: "Performance Titan",
      desc: "Avg session score exceeds 1200",
      icon: Zap,
      unlocked: (stats?.averagePerformance ?? 0) >= 1200,
      color: "text-primary border-primary/20 bg-primary/10",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="z-[150] flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl border-border bg-background p-0 font-sans sm:max-w-3xl"
        onOpenAutoFocus={() => { openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus(); }}
      >
        <header className="shrink-0 border-b border-border px-5 py-5 pr-12 sm:px-7">
          <DialogTitle className="font-heading text-lg font-medium tracking-tight text-foreground">Community profile</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">Practice, progress, and the milestones along the way.</DialogDescription>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          {isLoading && !userStats ? (
            <MemberPageState kind="loading" title="Loading profile" description="Gathering this learner’s practice statistics." />
          ) : error ? (
            <MemberPageState kind="error" title="We couldn’t load this profile" description="Try again to see this learner’s latest progress.">
              <Button variant="outline" onClick={() => mutate()}>Try again</Button>
            </MemberPageState>
          ) : user && stats ? (
            <div className="space-y-8">
              <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-primary/10 font-heading text-2xl text-primary">
                    {user.avatar ? <Image src={user.avatar} alt="" width={64} height={64} unoptimized className="size-full object-cover" /> : user.codeforcesHandle.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("mb-1 text-xs font-medium", aesthetic.text)}>{aesthetic.label}</p>
                    <h2 className="break-all font-heading text-2xl font-medium tracking-tight text-foreground">{user.codeforcesHandle}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Rating <span className="tabular-nums text-foreground">{user.rating}</span><span aria-hidden="true" className="mx-2">·</span>Best <span className="tabular-nums">{user.maxRating}</span></p>
                  </div>
                </div>
                <a href={`https://codeforces.com/profile/${user.codeforcesHandle}`} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg text-sm text-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:self-center">Codeforces <ArrowUpRight className="size-4" /></a>
              </section>

              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Sessions", value: stats.totalSessions },
                  { label: "Problems solved", value: stats.solvedProblems },
                  { label: "Avg. performance", value: stats.averagePerformance },
                  { label: "Best performance", value: stats.bestPerformance },
                ].map((metric) => <div key={metric.label} className="rounded-2xl border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">{metric.label}</dt><dd className="mt-2 font-heading text-2xl font-medium tabular-nums text-foreground">{metric.value}</dd></div>)}
              </dl>

              <section className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium text-foreground">Roadmap progress</h3><span className="text-xs text-primary">Level {level}</span></div>
                  <p className="mt-4 font-heading text-3xl font-medium tracking-tight tabular-nums text-primary">{xp.toLocaleString()} <span className="font-sans text-xs text-muted-foreground">XP</span></p>
                  <p className="mt-1 text-sm text-muted-foreground">{xpTitle}</p>
                  <StudioProgress value={progressPercent} label="Progress toward the next XP level" className="mt-5" />
                  <p className="mt-2 text-xs text-muted-foreground">{1000 - (xp % 1000)} XP to the next level</p>
                </div>
                <div className="space-y-5 py-1">
                  {[
                    { label: "Solve rate", value: stats.solvingRate, detail: `${stats.solvedProblems} of ${stats.totalProblems} problems` },
                    { label: "Upsolve completion", value: stats.upsolvedCount ? Math.round(stats.upsolvedSolvedCount / stats.upsolvedCount * 100) : 0, detail: `${stats.upsolvedSolvedCount} of ${stats.upsolvedCount} upsolves` },
                  ].map((metric) => <div key={metric.label}><div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="text-foreground">{metric.label}</span><span className="tabular-nums text-primary">{metric.value}%</span></div><StudioProgress value={metric.value} label={metric.label} /><p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p></div>)}
                  <p className="text-xs text-muted-foreground">Average problem rating <span className="ml-1 tabular-nums text-foreground">{formatAvgProblemRating(stats.averageRating)}</span></p>
                </div>
              </section>

              <section>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h3 className="font-heading text-lg font-medium tracking-tight text-foreground">Milestones</h3><span className="text-xs text-muted-foreground">{achievements.filter(badge => badge.unlocked).length} of {achievements.length} reached</span></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {achievements.map((badge) => <div key={badge.id} className={cn("flex items-start gap-3 rounded-2xl border p-4", badge.unlocked ? "border-primary/20 bg-primary/5" : "border-border")}><badge.icon className={cn("mt-0.5 size-4 shrink-0", badge.unlocked ? "text-primary" : "text-muted-foreground")} /><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-medium text-foreground">{badge.name}</h4>{!badge.unlocked && <span className="text-xs text-muted-foreground">Not yet reached</span>}</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{badge.desc}</p></div></div>)}
                </div>
              </section>

              <section>
                <h3 className="mb-4 font-heading text-lg font-medium tracking-tight text-foreground">Recent sessions</h3>
                {userStats.trainings.length ? <ul className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
                  {userStats.trainings.map(training => <li key={training.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4"><div><p className="text-sm text-foreground">{new Date(training.startTime).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p><p className="mt-1 text-xs text-muted-foreground">{training.solvedCount}/{training.problemsCount} solved<span className="mx-2" aria-hidden="true">·</span>{Math.round((training.endTime - training.startTime) / 60000)} min</p></div><p className="text-right font-heading text-xl tabular-nums text-primary">{training.performance}<span className="ml-2 font-sans text-xs text-muted-foreground">performance</span></p></li>)}
                </ul> : <p className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">This learner’s recent practice will appear here.</p>}
              </section>
            </div>
          ) : <MemberPageState title="Profile unavailable" description="This learner’s profile is not available right now." />}
        </div>
        <footer className="flex shrink-0 justify-end border-t border-border px-5 py-4 sm:px-7"><Button onClick={() => onOpenChange(false)} variant="outline">Close profile</Button></footer>
      </DialogContent>
    </Dialog>
  );
}

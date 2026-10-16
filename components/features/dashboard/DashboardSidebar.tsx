"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Compass, Target, Info, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry, UserRoadmapSummary } from "@/types/Roadmap";
import type { User } from "@/types/User";

type DashboardSidebarProps = {
  user: User;
  roadmapXp: number;
  roadmapProblemsSolved: number;
  summary: UserRoadmapSummary | undefined;
  leaderboard: LeaderboardEntry[] | undefined;
};

export default function DashboardSidebar({
  user,
  roadmapXp,
  roadmapProblemsSolved,
  summary,
  leaderboard,
}: DashboardSidebarProps) {
  return (
    <section aria-label="Continue your progress" className="grid gap-5 font-sans md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.1fr]">
      <Link href="/roadmap" className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-background/30 text-primary"><Compass className="size-[18px]" strokeWidth={1.5} /></div>
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">A path with purpose.</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">Work through your roadmap, one concept at a time.</p>
        <div className="my-6 grid grid-cols-2 divide-x divide-border">
          <div>
            <p className="font-heading text-2xl font-medium tracking-tight text-foreground tabular-nums">{roadmapXp.toLocaleString()}</p>
            <p className="mt-1 text-xs text-muted-foreground">XP earned</p>
          </div>
          <div className="pl-5">
            <p className="font-heading text-2xl font-medium tracking-tight text-foreground tabular-nums">{roadmapProblemsSolved}</p>
            <p className="mt-1 text-xs text-muted-foreground">Problems solved</p>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{summary?.currentLevel ? "Continue learning" : "Your next step"}</p>
            <p className="mt-1 truncate text-sm font-medium text-primary">{summary?.currentLevel?.title || "Explore the roadmap"}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>

      <article className="flex flex-col rounded-3xl border border-primary/20 bg-primary/[0.055] p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5 text-primary"><Target className="size-[18px]" strokeWidth={1.5} /></div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" aria-label="About your recommended difficulty" className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Info className="size-4" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="top" className="max-w-[240px] rounded-xl border-border bg-popover p-3 font-sans text-popover-foreground">
                  <p className="text-xs font-medium">Find your stretch zone</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Practice problems rated 100–300 points above your current rating to challenge yourself.</p>
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </div>
        <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">Your next challenge.</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">A little outside your comfort zone. Right where you grow.</p>
        <div className="my-6">
          <p className="font-heading text-3xl font-medium tracking-tight text-primary tabular-nums">{(user.rating || 0) + 100}<span className="px-2 text-primary/40">–</span>{(user.rating || 0) + 300}</p>
          <p className="mt-1 text-xs text-muted-foreground">Recommended problem rating</p>
        </div>
        <Button asChild variant="outline" className="mt-auto h-11 w-full justify-between rounded-full border-primary/25 bg-transparent px-5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary">
          <Link href="/training">Find a challenge <ArrowUpRight className="size-4" /></Link>
        </Button>
      </article>

      <article className="flex flex-col rounded-3xl border border-border bg-card p-6 md:col-span-2 xl:col-span-1">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">In good company.</h2>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">Top learners</span>
        </div>
        <p className="text-xs leading-6 text-muted-foreground">A community that keeps you moving.</p>
        <div className="my-4 flex-1 divide-y divide-border">
          {leaderboard && leaderboard.length > 0 ? (
            leaderboard.slice(0, 3).map((entry) => {
              const isMe = String(entry.userId) === String(user._id);
              return (
                <div key={entry.userId} className="flex items-center gap-3 py-3.5">
                  <span className="w-4 shrink-0 text-xs text-muted-foreground tabular-nums">{String(entry.rank).padStart(2, "0")}</span>
                  <Avatar className="size-8 shrink-0 rounded-full border border-border">
                    <AvatarImage src={entry.avatar ?? ""} alt={`${entry.handle}'s avatar`} />
                    <AvatarFallback className="bg-muted text-xs font-medium text-primary">{entry.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <p className={cn("min-w-0 flex-1 truncate text-xs font-medium", isMe ? "text-primary" : "text-foreground")}>
                    {entry.handle}{isMe && <span className="ml-1.5 font-normal text-muted-foreground">(you)</span>}
                  </p>
                  <span className="shrink-0 text-xs font-medium text-foreground tabular-nums">{entry.totalXp.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">XP</span></span>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center px-4 text-center">
              <p className="text-sm text-foreground">The journey is just beginning.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Complete roadmap problems to earn your place here.</p>
            </div>
          )}
        </div>
        <Link href="/leaderboard" className="group mt-auto flex items-center justify-between rounded border-t border-border pt-4 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Explore the leaderboard <ArrowUpRight className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </article>
    </section>
  );
}

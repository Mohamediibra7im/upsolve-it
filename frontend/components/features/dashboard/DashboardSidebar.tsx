"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, RotateCcw, Target, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import type { TrainingProblem } from "@/types/TrainingProblem";
import type { User } from "@/types/User";

type DashboardSidebarProps = {
  user: User;
  pendingUpsolves: TrainingProblem[];
};

export default function DashboardSidebar({
  user,
  pendingUpsolves,
}: DashboardSidebarProps) {
  return (
    <section aria-label="Continue your progress" className="grid gap-5 font-sans md:grid-cols-2">
      <article className="flex flex-col rounded-3xl border border-border bg-card p-6">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-border bg-background/30 text-primary"><RotateCcw className="size-[18px]" strokeWidth={1.5} /></div>
          <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground tabular-nums">{pendingUpsolves.length} waiting</span>
        </div>
        <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">Still owed.</h2>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">The oldest problems in your upsolve list.</p>
        <div className="my-4 flex-1 divide-y divide-border">
          {pendingUpsolves.length > 0 ? (
            pendingUpsolves.slice(0, 3).map((problem) => (
              <a key={`${problem.contestId}${problem.index}`} href={problem.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span className="w-14 shrink-0 text-xs text-muted-foreground tabular-nums">{problem.contestId}{problem.index}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground group-hover:text-primary">{problem.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{problem.rating}</span>
              </a>
            ))
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center px-4 text-center">
              <p className="text-sm text-foreground">You&apos;re all caught up.</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Unsolved problems from your sessions will appear here.</p>
            </div>
          )}
        </div>
        <Link href="/upsolve" className="group mt-auto flex items-center justify-between rounded border-t border-border pt-4 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Open your upsolve list <ArrowUpRight className="size-4 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </article>

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
    </section>
  );
}

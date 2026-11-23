"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, RefreshCw, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types/User";

type DashboardHeroProps = {
  user: User;
  upsolvePending: number;
  upsolveSolved: number;
  upsolveTotal: number;
  friendRequestCount: number;
  isSyncing: boolean;
  onSync: () => void;
};

export default function DashboardHero({
  user,
  upsolvePending,
  upsolveSolved,
  upsolveTotal,
  friendRequestCount,
  isSyncing,
  onSync,
}: DashboardHeroProps) {
  const reduceMotion = useReducedMotion();
  const circumference = 2 * Math.PI * 62;
  const solveRate = upsolveTotal > 0 ? Math.round((upsolveSolved / upsolveTotal) * 100) : 0;

  return (
    <m.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden rounded-[1.75rem] border border-border bg-card font-sans"
      aria-labelledby="dashboard-welcome"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8">
        <p className="flex items-center gap-2.5 text-xs font-medium tracking-wide text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          Your training studio
        </p>
        <div className="flex items-center gap-1">
          <Button
            onClick={onSync}
            disabled={isSyncing}
            variant="ghost"
            size="sm"
            className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-3.5", isSyncing && "animate-spin motion-reduce:animate-none")} />
            {isSyncing ? "Syncing…" : "Sync profile"}
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground">
            <Link href="/friends">
              <Users className="size-3.5" />
              Friends
              {friendRequestCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {friendRequestCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr]">
        <div className="flex min-w-0 flex-col items-start px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <p className="mb-3 text-sm text-muted-foreground">A new day. A little more progress.</p>
          <h1 id="dashboard-welcome" className="max-w-full font-heading text-[2rem] font-medium leading-[1.08] tracking-[-0.045em] text-foreground sm:text-5xl xl:text-[3.5rem]">
            Welcome back,<br />
            <span className="block max-w-full break-all text-primary">{user.codeforcesHandle}.</span>
          </h1>
          <p className="mt-5 max-w-[26rem] text-sm leading-7 text-muted-foreground">
            Build on what you know. Find your next challenge and make today&apos;s practice count.
          </p>
          <Button asChild className="mt-7 h-12 max-w-full rounded-full px-5 text-xs font-semibold transition-transform active:scale-[0.98] sm:px-6 sm:text-sm">
            <Link href="/training">Start a training session <ArrowUpRight className="ml-2 size-4" /></Link>
          </Button>
        </div>

        <div className="flex min-w-0 flex-col justify-center border-t border-border bg-background/25 px-6 py-8 sm:px-8 lg:border-l lg:border-t-0 lg:px-9">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">Your upsolve queue</p>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary tabular-nums">{solveRate}% cleared</span>
          </div>
          <div className="flex items-center justify-center gap-4 py-7 sm:gap-9">
            <div className="relative shrink-0" role="img" aria-label={`${upsolvePending} problems waiting, ${solveRate} percent of your queue solved`}>
              <svg viewBox="0 0 144 144" className="size-28 -rotate-90 sm:size-36" aria-hidden="true">
                <circle cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
                <m.circle
                  cx="72" cy="72" r="62" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={false}
                  animate={{ strokeDashoffset: circumference * (1 - solveRate / 100) }}
                  transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Waiting</span>
                <span className="mt-1 font-heading text-5xl font-medium leading-none tracking-tight text-foreground tabular-nums">{upsolvePending}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="break-all font-heading text-3xl font-medium tracking-tight text-foreground tabular-nums">{upsolveSolved.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">Upsolved so far</p>
              <div className="mt-5 h-px w-8 bg-border" />
              <p className="mt-4 text-sm font-medium text-primary tabular-nums">{upsolveTotal.toLocaleString()} tracked</p>
              <p className="mt-1 text-xs text-muted-foreground">Problems in your list</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Every problem you revisit makes you stronger.</span>
            <Link href="/upsolve" className="ml-3 shrink-0 rounded text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open your upsolve list"><ArrowUpRight className="size-4" /></Link>
          </div>
        </div>
      </div>
    </m.section>
  );
}

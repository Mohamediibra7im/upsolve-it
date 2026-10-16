"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowUpRight, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types/User";
import type { UserRoadmapSummary } from "@/types/Roadmap";

interface ProfileHeaderProps {
  user: User;
  summary: UserRoadmapSummary | undefined;
  syncProfile: () => void;
}

export default function ProfileHeader({ user, summary, syncProfile }: ProfileHeaderProps) {
  return (
    <m.section initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-[2rem] border border-border bg-card p-6 sm:p-8 lg:p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted-foreground">Your profile</p>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">Overview <ArrowUpRight className="size-4" /></Link>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 shrink-0 rounded-2xl border border-border bg-background sm:size-24">
            <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
            <AvatarFallback className="rounded-2xl bg-primary/10 font-heading text-3xl text-primary">{user.codeforcesHandle?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Codeforces member</span>
              {user.role === "admin" && <span className="rounded-full border border-border px-2 py-0.5">Admin</span>}
              {user.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary"><ShieldCheck className="size-3" />Verified</span>}
            </div>
            <h1 className="break-all font-heading text-[32px] font-medium leading-tight tracking-tight text-foreground sm:text-4xl">{user.codeforcesHandle}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground"><span className="capitalize text-foreground">{user.rank || "Unrated"}</span><span className="mx-2" aria-hidden="true">·</span>{user.organization || "Independent learner"}</p>
          </div>
        </div>
        <Button onClick={syncProfile} variant="outline" className="h-11 shrink-0 self-start rounded-xl border-border bg-transparent px-5 text-sm text-foreground lg:self-center"><RefreshCw className="mr-2 size-4" />Sync profile</Button>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
        <span>Learning <span className="font-medium text-foreground">{summary?.currentLevel?.title || "Novice"}</span></span>
        <span><span className="font-medium tabular-nums text-primary">{(summary?.totalXp || 0).toLocaleString()}</span> total XP</span>
      </div>
    </m.section>
  );
}

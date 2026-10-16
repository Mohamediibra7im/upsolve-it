"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import { useState } from "react";
import { m } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  ChevronDown,
} from "lucide-react";
import { useRoadmapLeaderboard, useRoadmapLevels } from "@/hooks/roadmap";
import { useUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileDialog } from "@/components/features/profile";

const XP_TIERS = [
  { min: 5000, label: "Legend", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { min: 3000, label: "Champion", color: "text-purple-400", bg: "bg-primary/10", border: "border-primary/20" },
  { min: 1500, label: "Strategist", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { min: 500, label: "Tactician", color: "text-primary", bg: "bg-primary/10", border: "border-border" },
  { min: 0, label: "Novice", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/40" },
] as const;

function getTier(xp: number) {
  return XP_TIERS.find((t) => xp >= t.min)!;
}

const LeaderboardPage = () => {
  const { user } = useUser();
  const { levels } = useRoadmapLevels();

  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    leaderboard,
    top3,
    totalPages,
    pageSize,
    myRank,
    isLoading,
    error,
    mutateLeaderboard,
  } = useRoadmapLeaderboard({
    level: selectedLevelId || undefined,
    period,
    page,
  });

  const currentUserEntry = user
    ? leaderboard.find((e) => String(e.userId) === String(user._id))
    : null;

  return (
    <div className="min-h-screen relative pb-24 font-sans text-foreground">
      {/* Background */}

      <div className="mx-auto w-full max-w-7xl space-y-8">

        {/* Hero / Header Section */}
        <m.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Trophy size={12} className="text-primary" />
            <span>The community leaderboard</span>
            <span className="flex-1 border-b border-border" />
            <span>All levels</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                A little friendly competition.
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl">
                Meet the people putting in the practice. Explore the weekly, monthly, and all-time rankings.
              </p>
            </div>


            {myRank && (
              <div className="inline-flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2 text-left shrink-0">
                <Avatar className="size-8 border border-border">
                  <AvatarImage src={user?.avatar ?? ""} />
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {user?.codeforcesHandle?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Your rank</span>
                  <div className="text-sm font-medium text-foreground">
                    #{myRank} <span className="text-muted-foreground font-normal">({currentUserEntry?.totalXp?.toLocaleString() ?? "—"} XP)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </m.section>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Period Tabs */}
          <div className="flex items-center gap-2">
            {(["all", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setPage(1); }}
                aria-pressed={period === p}
                className={cn(
                  "h-10 px-3 rounded-xl border font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  period === p
                    ? "bg-primary text-primary-foreground border-border"
                    : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                 {p === "all" ? "All time" : p === "weekly" ? "This week" : "This month"}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="relative">
            <select
              value={selectedLevelId}
              onChange={(e) => { setSelectedLevelId(e.target.value); setPage(1); }}
              title="Filter leaderboard by level"
              className="appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-xs font-medium text-primary focus:outline-none focus:border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl._id} value={lvl._id} className="bg-card">
                  L{lvl.orderIndex}: {lvl.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <MemberPageState kind="loading" title="Gathering the rankings" description="Loading the community’s latest progress." />
        ) : error && leaderboard.length === 0 ? (
          <MemberPageState kind="error" title="Rankings are unavailable" description="We couldn’t load the leaderboard. Try again to see the latest standings."><Button variant="outline" onClick={() => mutateLeaderboard()}>Try again</Button></MemberPageState>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="size-14 rounded-lg border border-border bg-card flex items-center justify-center mx-auto text-muted-foreground">
              <Trophy size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground font-heading text-lg tracking-tight">A fresh start.</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                There are no rankings for these filters yet. Try another period or level.
              </p>
            </div>
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <section aria-label="Leading learners" className="grid gap-4 sm:grid-cols-3">
                {top3.map((learner, index) => (
                  <m.button
                    key={learner.userId}
                    type="button"
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedUserId(learner.userId)}
                    className={cn("group flex min-w-0 flex-col items-start rounded-2xl border bg-card p-5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", index === 0 ? "border-primary/35" : "border-border")}
                  >
                    <div className="mb-6 flex w-full items-center justify-between gap-3">
                      <span className="text-sm font-medium text-muted-foreground">{index === 0 ? "Leading the way" : `Rank ${index + 1}`}</span>
                      {index === 0 ? <Crown className="size-5 text-primary" /> : <Medal className="size-5 text-muted-foreground" />}
                    </div>
                    <Avatar className="mb-4 size-14 rounded-2xl border border-border">
                      <AvatarImage src={learner.avatar ?? ""} alt="" />
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">{learner.handle.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="w-full truncate font-heading text-xl font-medium tracking-tight text-foreground">{learner.handle}</span>
                    <div className="mt-5 flex w-full flex-wrap items-end justify-between gap-2 border-t border-border pt-4">
                      <span className="font-heading text-2xl tabular-nums text-primary">{learner.totalXp.toLocaleString()} <span className="font-sans text-xs text-muted-foreground">XP</span></span>
                      <span className="text-xs text-muted-foreground">{learner.problemsSolved} solved</span>
                    </div>
                  </m.button>
                ))}
              </section>
            )}

            {/* Leaderboard List */}
            <div className="rounded-2xl border border-border bg-card p-3 sm:p-5">
              {/* List Header */}
              <div className="hidden sm:grid grid-cols-[56px_1fr_80px_80px_100px] items-center px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <span>Rank</span>
                <span>Learner</span>
                <span className="text-center">Topics</span>
                <span className="text-center">Solved</span>
                <span className="text-right">Total XP</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-border">
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser = user && String(entry.userId) === String(user._id);
                  const tier = getTier(entry.totalXp);

                  return (
                    <m.div
                      key={entry.userId}
                      initial={false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.01 }}
                    >
                      <div
                        className={cn(
                          "group grid grid-cols-[32px_minmax(0,1fr)_auto] sm:grid-cols-[56px_1fr_80px_80px_100px] items-center py-3 px-2 sm:px-4 hover:bg-card transition-all duration-200",
                          isCurrentUser && "bg-primary/10 border-b border-border"
                        )}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-start">
                          {entry.rank <= 3 ? (
                            <div
                              className={cn(
                                "flex items-center justify-center size-6 rounded-lg text-xs font-medium",
                                entry.rank === 1 && "bg-amber-400/15 text-amber-400",
                                entry.rank === 2 && "bg-zinc-400/15 text-zinc-400",
                                entry.rank === 3 && "bg-amber-700/15 text-amber-700"
                              )}
                            >
                              {entry.rank === 1 ? (
                                <Crown size={12} className="fill-current" />
                              ) : (
                                `0${entry.rank}`
                              )}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground font-sans tabular-nums">
                              #{String(entry.rank).padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        {/* User info */}
                        <div
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedUserId(entry.userId); } }}
                          onClick={() => setSelectedUserId(entry.userId)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer group/user rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Avatar className="size-8 border border-border">
                            <AvatarImage src={entry.avatar ?? ""} />
                            <AvatarFallback className="bg-card text-xs text-primary font-medium">
                              {entry.handle.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-sm text-foreground truncate group-hover/user:text-primary transition-colors">
                                {entry.handle}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs font-medium text-muted-foreground bg-primary/10 border border-border px-1 rounded-lg">
                                  You
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "inline-block text-xs font-medium mt-0.5",
                                tier.color
                              )}
                            >
                              {tier.label}
                            </span>
                          </div>
                        </div>

                        {/* Topics (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {entry.topicsDone}
                          </span>
                        </div>

                        {/* Solved (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-xs font-medium text-primary tabular-nums">
                            {entry.problemsSolved}
                          </span>
                        </div>

                        {/* XP */}
                        <div className="flex items-center justify-end gap-2">
                          <span className="sm:hidden text-xs text-primary mr-1 tabular-nums">
                            {entry.problemsSolved} AC
                          </span>
                          <span className="text-xs font-medium text-foreground tabular-nums">
                            {entry.totalXp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "h-10 px-3 rounded-xl border font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans",
                    page <= 1
                      ? "border-border text-muted-foreground cursor-not-allowed"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  Previous
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "h-10 px-3 rounded-xl border font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-sans",
                    page >= totalPages
                      ? "border-border text-muted-foreground cursor-not-allowed"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  Next
                </button>

                {myRank && (
                  <button
                    onClick={() => setPage(Math.ceil(myRank / pageSize))}
                    className="h-9 px-3 rounded-lg border border-border bg-card text-foreground font-medium text-xs transition-all duration-200 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Find my rank
                  </button>
                )}
              </div>

              <span className="text-xs font-medium text-muted-foreground tabular-nums">
                Page {page}/{totalPages}
              </span>
            </div>

            <UserProfileDialog
              userId={selectedUserId}
              open={selectedUserId !== null}
              onOpenChange={(open) => !open && setSelectedUserId(null)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

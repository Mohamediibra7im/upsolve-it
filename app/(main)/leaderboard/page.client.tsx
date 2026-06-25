"use client";

import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Zap,
  Crown,
  Medal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from "lucide-react";
import { useRoadmapLeaderboard, useRoadmapLevels } from "@/hooks/roadmap";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileDialog } from "@/components/features/profile";


const XP_TIERS = [
  { min: 5000, label: "Legend", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  { min: 3000, label: "Champion", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { min: 1500, label: "Strategist", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { min: 500, label: "Tactician", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  { min: 0, label: "Novice", color: "text-muted-foreground", bg: "bg-muted/50", border: "border-border/40" },
] as const;

function getTier(xp: number) {
  return XP_TIERS.find((t) => xp >= t.min)!;
}

const LeaderboardPage = () => {
  const { user } = useUser();
  const { levels, isLoading: levelsLoading } = useRoadmapLevels();

  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all");
  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    leaderboard,
    top3,
    totalPages,
    total,
    pageSize,
    myRank,
    isLoading: boardLoading,
  } = useRoadmapLeaderboard({
    level: selectedLevelId || undefined,
    period,
    page,
  });

  const isLoading = levelsLoading || boardLoading;

  // Current user entry on the current page
  const currentUserEntry = user
    ? leaderboard.find((e) => String(e.userId) === String(user._id))
    : null;

  return (
    <div className="min-h-screen relative pb-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/8 via-background to-transparent" />
        <div className="absolute top-20 left-1/3 size-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 size-[400px] bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        {/* Back Link */}
        <div className="flex items-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-border/60 dark:border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-xl px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Hero */}
        <m.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[2.5rem] border border-border/60 dark:border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-primary/10 blur-[80px]" />
            <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-emerald-500/10 blur-[80px]" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-primary">
              <Trophy className="size-4" />
              CP Arena
            </div>
            <h1 className="text-4xl sm:text-5xl font-heading font-black uppercase tracking-tight text-foreground">
              Community <span className="text-primary">Leaderboard</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto">
              Track the community&apos;s progress, compare weekly or monthly XP gains,
              and claim your spot at the top of the leaderboards!
            </p>
          </div>

          {/* User rank badge */}
          {myRank && (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative z-10 mt-6 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md px-5 py-3"
            >
              <div className="relative">
                <Avatar className="size-9 border-2 border-emerald-500/30">
                  <AvatarImage src={user?.avatar ?? ""} />
                  <AvatarFallback className="bg-emerald-500/10 text-[10px] font-black text-emerald-400">
                    {user?.codeforcesHandle?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Your Rank</p>
                <p className="text-sm font-black text-foreground">
                  #{myRank}{" "}
                  <span className="text-muted-foreground font-bold">
                    &middot; {currentUserEntry?.totalXp?.toLocaleString() ?? "—"} XP
                  </span>
                </p>
              </div>
            </m.div>
          )}
        </m.section>

        {/* Filter Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          {/* Period Tabs */}
          <div className="flex rounded-2xl border border-border/60 dark:border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-xl p-1">
            {(["all", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setPage(1); }}
                className={cn(
                  "rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300",
                  period === p
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="relative">
            <select
              value={selectedLevelId}
              onChange={(e) => { setSelectedLevelId(e.target.value); setPage(1); }}
              title="Filter leaderboard by level"
              className="appearance-none rounded-2xl border border-border/60 dark:border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-xl px-4 py-2.5 pr-10 text-xs font-black uppercase tracking-[0.1em] text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl._id} value={lvl._id}>
                  Level {lvl.orderIndex}: {lvl.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="mt-12 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted/30" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-border/60 dark:border-border/30 bg-card/40 backdrop-blur-xl p-12 text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-muted/30 border border-border/40">
              <Trophy className="size-8 text-muted-foreground/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-foreground">No Rankings Yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                No rankings available for this filter combination. Start solving to make history!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {top3.length > 0 && (
              <div className="mt-14 flex items-end justify-center gap-3 sm:gap-5 md:gap-8 max-w-3xl mx-auto px-2">
                {/* 2nd Place */}
                {top3[1] && (
                  <m.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    onClick={() => setSelectedUserId(top3[1].userId)}
                    className="flex-1 flex flex-col items-center min-w-0 cursor-pointer group"
                  >
                    <div className="relative mb-3 shrink-0">
                      <div className="rounded-full p-[2px] bg-gradient-to-br from-zinc-300 to-zinc-400 shadow-lg shadow-zinc-400/10">
                        <Avatar className="size-16 sm: sm:size-20 border-[3px] border-background dark:border-zinc-900 group-hover:scale-105 transition-transform duration-300">
                          <AvatarImage src={top3[1].avatar ?? ""} />
                          <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-black">
                            {top3[1].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background dark:bg-zinc-900 border border-zinc-400/30 rounded-full p-1 shadow-md">
                        <Medal className="size-3.5 text-zinc-400" />
                      </div>
                    </div>
                    <span className="font-heading font-black text-xs sm:text-sm text-foreground truncate max-w-full text-center px-1 group-hover:text-primary transition-colors">
                      {top3[1].handle}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-0.5 flex items-center gap-0.5">
                      <Zap className="size-3.5 fill-current text-primary" />
                      {top3[1].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-muted-foreground/70 font-medium mt-0.5">
                      {top3[1].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-4 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-zinc-400/10 via-zinc-400/5 to-transparent border-t border-x border-zinc-400/20 flex flex-col items-center justify-center h-20 sm:h-28 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-400/5 to-transparent pointer-events-none" />
                      <span className="text-2xl sm:text-4xl font-black text-zinc-400/40 tracking-tight font-mono relative z-10">
                        2
                      </span>
                    </div>
                  </m.div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <m.div
                    initial={{ opacity: 0, y: 45 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    onClick={() => setSelectedUserId(top3[0].userId)}
                    className="flex-[1.15] flex flex-col items-center min-w-0 z-10 cursor-pointer group"
                  >
                    <div className="relative mb-3 shrink-0">
                      <div className="rounded-full p-[3px] bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl shadow-amber-400/20">
                        <Avatar className="size-20 sm: sm:size-24 border-[4px] border-background dark:border-zinc-900 group-hover:scale-105 transition-transform duration-300">
                          <AvatarImage src={top3[0].avatar ?? ""} />
                          <AvatarFallback className="bg-secondary text-amber-500 text-base font-black">
                            {top3[0].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-background dark:bg-zinc-900 border border-amber-400/40 rounded-full p-1.5 shadow-lg shadow-amber-500/15">
                        <Crown className=".5 size-4.5 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" />
                      </div>
                    </div>
                    <span className="font-heading font-black text-sm sm:text-base text-foreground truncate max-w-full text-center px-1 group-hover:text-primary transition-colors">
                      {top3[0].handle}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-amber-400 mt-0.5 flex items-center gap-0.5">
                      <Zap className="size-4 fill-current text-amber-400" />
                      {top3[0].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[10px] text-amber-500/70 font-bold uppercase tracking-wider mt-0.5">
                      {top3[0].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-4 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-400/15 via-amber-400/5 to-transparent border-t border-x border-amber-400/25 flex flex-col items-center justify-center h-28 sm:h-36 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/10 to-transparent pointer-events-none" />
                      <span className="text-3xl sm:text-5xl font-black text-amber-400/60 tracking-tight font-mono relative z-10">
                        1
                      </span>
                    </div>
                  </m.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <m.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    onClick={() => setSelectedUserId(top3[2].userId)}
                    className="flex-1 flex flex-col items-center min-w-0 cursor-pointer group"
                  >
                    <div className="relative mb-3 shrink-0">
                      <div className="rounded-full p-[2px] bg-gradient-to-br from-amber-600 to-amber-700 shadow-lg shadow-amber-700/10">
                        <Avatar className="size-14 sm: sm:size-16 border-[3px] border-background dark:border-zinc-900 group-hover:scale-105 transition-transform duration-300">
                          <AvatarImage src={top3[2].avatar ?? ""} />
                          <AvatarFallback className="bg-secondary text-amber-700 text-xs font-black">
                            {top3[2].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-background dark:bg-zinc-900 border border-amber-700/30 rounded-full p-0.5 shadow-md">
                        <Medal className="size-3 text-amber-700" />
                      </div>
                    </div>
                    <span className="font-heading font-black text-xs sm:text-sm text-foreground truncate max-w-full text-center px-1 group-hover:text-primary transition-colors">
                      {top3[2].handle}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-amber-700 mt-0.5 flex items-center gap-0.5">
                      <Zap className="size-3.5 fill-current text-primary" />
                      {top3[2].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-muted-foreground/70 font-medium mt-0.5">
                      {top3[2].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-4 rounded-t-2xl sm:rounded-t-3xl bg-gradient-to-b from-amber-700/10 via-amber-700/5 to-transparent border-t border-x border-amber-700/20 flex flex-col items-center justify-center h-16 sm:h-22 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-700/5 to-transparent pointer-events-none" />
                      <span className="text-xl sm:text-3xl font-black text-amber-700/40 tracking-tight font-mono relative z-10">
                        3
                      </span>
                    </div>
                  </m.div>
                )}
              </div>
            )}

            {/* Leaderboard List */}
            <div className="mt-10 space-y-2">
              {/* List Header */}
              <div className="hidden sm:grid grid-cols-[56px_1fr_80px_80px_100px] items-center px-5 py-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">Rank</span>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">User</span>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 text-center">Topics</span>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 text-center">Solved</span>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 text-right">Total XP</span>
              </div>

              {/* Rows */}
              {leaderboard.map((entry, idx) => {
                const isCurrentUser = user && String(entry.userId) === String(user._id);
                const tier = getTier(entry.totalXp);

                return (
                  <m.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.02 }}
                  >
                    <div
                      className={cn(
                        "group grid grid-cols-[40px_1fr_auto] sm:grid-cols-[56px_1fr_80px_80px_100px] items-center gap-3 sm:gap-0 rounded-2xl border px-4 sm:px-5 py-3.5 sm:py-4 transition-all duration-300",
                        isCurrentUser
                          ? "border-emerald-500/25 bg-emerald-500/[0.04] hover:border-emerald-500/40 hover:bg-emerald-500/[0.06]"
                          : "border-border/40 bg-card/30 hover:border-border/60 hover:bg-card/50",
                        entry.rank <= 3 && !isCurrentUser && "border-border/50 bg-card/40"
                      )}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center">
                        {entry.rank <= 3 ? (
                          <div
                            className={cn(
                              "flex items-center justify-center size-8 rounded-lg text-xs font-black",
                              entry.rank === 1 && "bg-amber-400/15 text-amber-400",
                              entry.rank === 2 && "bg-zinc-400/15 text-zinc-400",
                              entry.rank === 3 && "bg-amber-700/15 text-amber-700"
                            )}
                          >
                            {entry.rank === 1 ? (
                              <Crown className="size-4 fill-current" />
                            ) : (
                              entry.rank
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground/60 font-mono">
                            #{entry.rank}
                          </span>
                        )}
                      </div>

                      {/* User */}
                      <div 
                        onClick={() => setSelectedUserId(entry.userId)}
                        className="flex items-center gap-3 min-w-0 cursor-pointer group/user"
                      >
                        <div className="relative shrink-0">
                          <Avatar className="size-9 border border-border/60 dark:border-zinc-800 bg-background dark:bg-zinc-900">
                            <AvatarImage src={entry.avatar ?? ""} />
                            <AvatarFallback className="bg-secondary text-[10px] text-muted-foreground font-bold">
                              {entry.handle.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {entry.rank <= 3 && (
                            <span
                              className={cn(
                                "absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-background dark:border-zinc-950 flex items-center justify-center text-[7px] font-black",
                                entry.rank === 1 && "bg-amber-400 text-amber-950",
                                entry.rank === 2 && "bg-zinc-400 text-zinc-950",
                                entry.rank === 3 && "bg-amber-700 text-white"
                              )}
                            >
                              {entry.rank}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-black text-sm text-foreground truncate group-hover/user:text-primary transition-colors">
                              {entry.handle}
                            </span>
                            {isCurrentUser && (
                              <span className="shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-400">
                                You
                              </span>
                            )}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider mt-0.5",
                              tier.bg,
                              tier.border,
                              tier.color
                            )}
                          >
                            {tier.label}
                          </span>
                        </div>
                      </div>

                      {/* Topics (hidden on mobile) */}
                      <div className="hidden sm:flex items-center justify-center">
                        <span className="text-xs font-bold text-muted-foreground/80 font-mono tabular-nums">
                          {entry.topicsDone}
                        </span>
                      </div>

                      {/* Solved (hidden on mobile) */}
                      <div className="hidden sm:flex items-center justify-center">
                        <span className="text-xs font-extrabold text-emerald-500 font-mono tabular-nums">
                          {entry.problemsSolved}
                        </span>
                      </div>

                      {/* XP — mobile shows solved count here */}
                      <div className="flex items-center justify-end gap-2">
                        <span className="sm:hidden text-[10px] font-bold text-emerald-500 font-mono mr-1">
                          {entry.problemsSolved} AC
                        </span>
                        <span className="text-xs font-black text-foreground tabular-nums">
                          {entry.totalXp.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-wider hidden sm:inline">
                          XP
                        </span>
                      </div>
                    </div>
                  </m.div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-200",
                    page <= 1
                      ? "border-border/30 text-muted-foreground/40 cursor-not-allowed"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/40"
                  )}
                >
                  <ChevronLeft className="size-4" />
                  Prev
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] transition-all duration-200",
                    page >= totalPages
                      ? "border-border/30 text-muted-foreground/40 cursor-not-allowed"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary bg-card/40"
                  )}
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <span className="text-xs font-bold text-muted-foreground/70 font-mono tabular-nums">
                Page {page} of {totalPages}
              </span>

              {myRank && (
                <button
                  onClick={() => setPage(Math.ceil(myRank / pageSize))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-emerald-400 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <Navigation className="size-4" />
                  Go to my rank (#{myRank})
                </button>
              )}
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

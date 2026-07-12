"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
  Trophy,
  Zap,
  Crown,
  Medal,
  ChevronDown,
  Cpu,
} from "lucide-react";
import { useRoadmapLeaderboard, useRoadmapLevels } from "@/hooks/roadmap";
import { useUser } from "@/hooks/auth";
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
  } = useRoadmapLeaderboard({
    level: selectedLevelId || undefined,
    period,
    page,
  });

  const currentUserEntry = user
    ? leaderboard.find((e) => String(e.userId) === String(user._id))
    : null;

  return (
    <div className="min-h-screen relative pb-24 font-mono text-emerald-400">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl space-y-6">

        {/* Hero / Header Section */}
        <m.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Trophy size={12} className="text-emerald-400" />
            <span>RANKING_ENGINE // COMMUNITY_MATRIX</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>ACTIVE: ALL_SECTORS</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Community Leaderboard
              </h1>
              <p className="text-[11px] text-emerald-500/40 max-w-xl">
                Compare weekly, monthly, and overall XP gains across the competitive programming matrix.
              </p>
            </div>

            {/* My Rank telemetry */}
            {myRank && (
              <div className="inline-flex items-center gap-3 rounded border border-emerald-500/15 bg-emerald-950/10 px-4 py-2 text-left shrink-0">
                <Avatar className="size-8 border border-emerald-500/30">
                  <AvatarImage src={user?.avatar ?? ""} />
                  <AvatarFallback className="bg-emerald-500/10 text-[9px] font-bold text-emerald-400">
                    {user?.codeforcesHandle?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/30">MY_RANK</span>
                  <div className="text-[11px] font-bold text-emerald-300">
                    #{myRank} <span className="text-emerald-500/40 font-normal">({currentUserEntry?.totalXp?.toLocaleString() ?? "—"} XP)</span>
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
                className={cn(
                  "h-9 px-3 rounded border font-bold uppercase tracking-widest text-[9px] transition-all duration-200",
                  period === p
                    ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "bg-transparent border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
                )}
              >
                [ {p.toUpperCase()}.SH ]
              </button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="relative">
            <select
              value={selectedLevelId}
              onChange={(e) => { setSelectedLevelId(e.target.value); setPage(1); }}
              title="Filter leaderboard by level"
              className="appearance-none rounded border border-emerald-500/20 bg-[#060a08] px-3 py-2 pr-8 text-[9px] font-bold uppercase tracking-wider text-emerald-400 focus:outline-none focus:border-emerald-500/40 transition-colors cursor-pointer"
            >
              <option value="">All Levels</option>
              {levels.map((lvl) => (
                <option key={lvl._id} value={lvl._id} className="bg-[#060a08]">
                  L{lvl.orderIndex}: {lvl.title.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3 text-emerald-500/50 pointer-events-none" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 border-b border-emerald-500/10" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="size-14 rounded border border-emerald-500/15 bg-emerald-950/10 flex items-center justify-center mx-auto text-emerald-500/30">
              <Trophy size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">No Rankings Found</h3>
              <p className="text-[11px] text-emerald-500/40 max-w-xs mx-auto">
                No active session records exist for the selected filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Podium — Top 3 */}
            {top3.length > 0 && (
              <div className="mt-8 flex items-end justify-center gap-4 max-w-2xl mx-auto px-2">
                {/* 2nd Place */}
                {top3[1] && (
                  <m.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedUserId(top3[1].userId)}
                    className="flex-1 flex flex-col items-center min-w-0 cursor-pointer group"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="rounded-full p-0.5 border border-zinc-400/20 bg-zinc-950/30">
                        <Avatar className="size-14 border border-zinc-400/40 group-hover:scale-105 transition-transform duration-200">
                          <AvatarImage src={top3[1].avatar ?? ""} />
                          <AvatarFallback className="bg-zinc-900 text-zinc-400 text-xs font-bold">
                            {top3[1].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#040604] border border-zinc-400/30 rounded-full p-0.5">
                        <Medal size={12} className="text-zinc-400" />
                      </div>
                    </div>
                    <span className="font-bold text-[11px] text-emerald-300 truncate max-w-full text-center group-hover:text-emerald-200 transition-colors">
                      {top3[1].handle}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-0.5">
                      <Zap size={10} className="fill-current text-primary" />
                      {top3[1].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-emerald-500/30 font-medium">
                      {top3[1].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-3 rounded-t border-t border-x border-zinc-400/20 bg-zinc-950/10 flex flex-col items-center justify-center h-16 relative">
                      <span className="text-xl font-bold text-zinc-400/20 font-mono">
                        02
                      </span>
                    </div>
                  </m.div>
                )}

                {/* 1st Place */}
                {top3[0] && (
                  <m.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => setSelectedUserId(top3[0].userId)}
                    className="flex-[1.1] flex flex-col items-center min-w-0 z-10 cursor-pointer group"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="rounded-full p-0.5 border border-amber-400/30 bg-amber-950/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        <Avatar className="size-16 border border-amber-400/40 group-hover:scale-105 transition-transform duration-200">
                          <AvatarImage src={top3[0].avatar ?? ""} />
                          <AvatarFallback className="bg-amber-950/20 text-amber-400 text-sm font-bold">
                            {top3[0].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#040604] border border-amber-400/40 rounded-full p-0.5">
                        <Crown size={12} className="text-amber-400" />
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-300 truncate max-w-full text-center group-hover:text-emerald-200 transition-colors">
                      {top3[0].handle}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 mt-0.5 flex items-center gap-0.5">
                      <Zap size={10} className="fill-current text-amber-400" />
                      {top3[0].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-amber-500/40 font-bold uppercase tracking-wider">
                      {top3[0].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-3 rounded-t border-t border-x border-amber-400/25 bg-amber-950/5 flex flex-col items-center justify-center h-22 relative">
                      <span className="text-2xl font-bold text-amber-400/20 font-mono">
                        01
                      </span>
                    </div>
                  </m.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <m.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedUserId(top3[2].userId)}
                    className="flex-1 flex flex-col items-center min-w-0 cursor-pointer group"
                  >
                    <div className="relative mb-2 shrink-0">
                      <div className="rounded-full p-0.5 border border-amber-700/20 bg-amber-950/5">
                        <Avatar className="size-12 border border-amber-700/40 group-hover:scale-105 transition-transform duration-200">
                          <AvatarImage src={top3[2].avatar ?? ""} />
                          <AvatarFallback className="bg-amber-950/20 text-amber-700 text-[10px] font-bold">
                            {top3[2].handle.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#040604] border border-amber-700/30 rounded-full p-0.5">
                        <Medal size={10} className="text-amber-700" />
                      </div>
                    </div>
                    <span className="font-bold text-[11px] text-emerald-300 truncate max-w-full text-center group-hover:text-emerald-200 transition-colors">
                      {top3[2].handle}
                    </span>
                    <span className="text-[10px] text-amber-700 mt-0.5 flex items-center gap-0.5">
                      <Zap size={10} className="fill-current text-primary" />
                      {top3[2].totalXp.toLocaleString()} XP
                    </span>
                    <span className="text-[9px] text-emerald-500/30 font-medium">
                      {top3[2].problemsSolved} solved
                    </span>

                    {/* Column */}
                    <div className="w-full mt-3 rounded-t border-t border-x border-amber-700/20 bg-[#060a08]/10 flex flex-col items-center justify-center h-12 relative">
                      <span className="text-lg font-bold text-amber-700/20 font-mono">
                        03
                      </span>
                    </div>
                  </m.div>
                )}
              </div>
            )}

            {/* Leaderboard List */}
            <div className="space-y-2 pt-6">
              {/* List Header */}
              <div className="hidden sm:grid grid-cols-[56px_1fr_80px_80px_100px] items-center px-4 py-2 text-[8px] font-bold uppercase tracking-widest text-emerald-500/25 border-b border-emerald-500/10">
                <span>RANK</span>
                <span>USER_NODE</span>
                <span className="text-center">TOPICS</span>
                <span className="text-center">SOLVED</span>
                <span className="text-right">TOTAL_XP</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-emerald-500/[0.07]">
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser = user && String(entry.userId) === String(user._id);
                  const tier = getTier(entry.totalXp);

                  return (
                    <m.div
                      key={entry.userId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.01 }}
                    >
                      <div
                        className={cn(
                          "group grid grid-cols-[40px_1fr_auto] sm:grid-cols-[56px_1fr_80px_80px_100px] items-center py-3 px-2 sm:px-4 hover:bg-emerald-950/5 transition-all duration-200",
                          isCurrentUser && "bg-emerald-500/[0.03] border-b border-emerald-500/20"
                        )}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-start">
                          {entry.rank <= 3 ? (
                            <div
                              className={cn(
                                "flex items-center justify-center size-6 rounded text-[10px] font-bold",
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
                            <span className="text-[10px] font-bold text-emerald-500/40 font-mono tabular-nums">
                              #{String(entry.rank).padStart(2, "0")}
                            </span>
                          )}
                        </div>

                        {/* User info */}
                        <div
                          onClick={() => setSelectedUserId(entry.userId)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer group/user"
                        >
                          <Avatar className="size-8 border border-emerald-500/10">
                            <AvatarImage src={entry.avatar ?? ""} />
                            <AvatarFallback className="bg-emerald-950/20 text-[9px] text-emerald-400 font-bold">
                              {entry.handle.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-emerald-300 truncate group-hover/user:text-emerald-200 transition-colors">
                                {entry.handle}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/60 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                                  [YOU]
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "inline-block text-[8px] font-bold uppercase tracking-wider mt-0.5",
                                tier.color
                              )}
                            >
                              {tier.label}
                            </span>
                          </div>
                        </div>

                        {/* Topics (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-500/40 tabular-nums">
                            {entry.topicsDone}
                          </span>
                        </div>

                        {/* Solved (desktop) */}
                        <div className="hidden sm:flex items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-400 tabular-nums">
                            {entry.problemsSolved}
                          </span>
                        </div>

                        {/* XP */}
                        <div className="flex items-center justify-end gap-2">
                          <span className="sm:hidden text-[9px] text-emerald-400 mr-1 tabular-nums">
                            {entry.problemsSolved} AC
                          </span>
                          <span className="text-[10px] font-bold text-emerald-300 tabular-nums">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-emerald-500/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={cn(
                    "h-9 px-3 rounded border font-bold uppercase tracking-widest text-[9px] transition-all duration-200 font-mono",
                    page <= 1
                      ? "border-emerald-500/10 text-emerald-500/20 cursor-not-allowed"
                      : "border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
                  )}
                >
                  [ PREV.SH ]
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className={cn(
                    "h-9 px-3 rounded border font-bold uppercase tracking-widest text-[9px] transition-all duration-200 font-mono",
                    page >= totalPages
                      ? "border-emerald-500/10 text-emerald-500/20 cursor-not-allowed"
                      : "border-emerald-500/20 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
                  )}
                >
                  [ NEXT.SH ]
                </button>

                {myRank && (
                  <button
                    onClick={() => setPage(Math.ceil(myRank / pageSize))}
                    className="h-9 px-3 rounded border border-emerald-500/35 bg-emerald-950/15 text-emerald-300 font-bold uppercase tracking-widest text-[9px] transition-all duration-200 hover:bg-emerald-500/10"
                  >
                    [ JUMP_TO_MY_RANK.EXE ]
                  </button>
                )}
              </div>

              <span className="text-[10px] font-bold text-emerald-500/40 tabular-nums">
                PAGE {page}/{totalPages}
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

"use client";

import Link from "next/link";
import {m} from "framer-motion";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {
  Target,
  Zap,
  Crown,
  Compass,
  ChevronRight,
  Shield,
  Info,
  Trophy,
} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";

import { LeaderboardEntry } from "@/types/Roadmap";

type DashboardSidebarProps = {
  user: any;
  roadmapXp: number;
  roadmapProblemsSolved: number;
  summary: any;
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
    <div className="space-y-6">
      {/* Roadmap Progress Hub */}
      <m.div
        initial={{opacity: 0, scale: 0.97}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: 0.4}}
      >
        <Link href="/roadmap">
          <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <Compass className="absolute -right-3 -top-3 size-20 opacity-[0.04] group-hover:opacity-[0.08] text-primary transition-opacity" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Compass size={16} className="text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Roadmap Progress
                  </h3>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Stat mini-grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-muted/60 dark:bg-white/[0.03] border border-border/50 dark:border-white/5 p-3 text-center">
                  <Zap className="size-4 mx-auto mb-1.5 text-primary" />
                  <p className="text-lg font-black tabular-nums leading-none">
                    {roadmapXp.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-black uppercase text-muted-foreground/80 dark:text-muted-foreground/40 mt-1">
                    XP
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/60 dark:bg-white/[0.03] border border-border/50 dark:border-white/5 p-3 text-center">
                  <Target className="size-4 mx-auto mb-1.5 text-emerald-400" />
                  <p className="text-lg font-black tabular-nums leading-none">
                    {roadmapProblemsSolved}
                  </p>
                  <p className="text-[8px] font-black uppercase text-muted-foreground/80 dark:text-muted-foreground/40 mt-1">
                    Solved
                  </p>
                </div>
              </div>

              {/* Current level */}
              {summary?.currentLevel && (
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-3 flex items-center gap-3">
                  <Shield className="size-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary/50">
                      Current Level
                    </p>
                    <p className="text-xs font-black text-foreground truncate">
                      {summary.currentLevel.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Link>
      </m.div>

      {/* Recommended Goal */}
      <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/8 transition-colors duration-500" />
        <Target
          size={100}
          className="absolute bottom-[-15px] right-[-15px] opacity-[0.06] text-emerald-500 group-hover:scale-110 transition-transform"
        />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Target size={14} className="text-emerald-500" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Next Goal
              </h3>
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    title="Training guide"
                    aria-label="Training guide"
                    className="size-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <Info size={12} aria-hidden />
                  </button>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    side="left"
                    className="bg-card/95 backdrop-blur-2xl border-white/10 p-3 rounded-xl shadow-2xl max-w-[220px] z-[9999]"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                      Training Guide
                    </p>
                    <p className="text-[10px] font-medium leading-relaxed text-muted-foreground mt-1">
                      Practice problems in the{" "}
                      <span className="text-foreground font-bold">
                        +100 to +300
                      </span>{" "}
                      range above your current rating for optimal growth.
                    </p>
                  </TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="text-foreground/80 font-medium leading-relaxed text-sm">
            Practice in the{" "}
            <span className="text-emerald-400 font-black tabular-nums">
              {user.rating + 100} – {user.rating + 300}
            </span>{" "}
            range.
          </p>
          <Button
            asChild
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Link href="/training">Start Recommended Session</Link>
          </Button>
        </div>
      </Card>

      {/* Leaderboard Preview */}
      {leaderboard && leaderboard.length > 0 && (
        <m.div
          initial={{opacity: 0, y: 10}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.6}}
        >
          <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="p-6 border-b border-border/60 dark:border-border/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Trophy size={14} className="text-amber-400" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                  Top Ranked
                </h3>
              </div>
              <Link
                href="/leaderboard"
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
              >
                All <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/50 dark:divide-border/10">
              {leaderboard.slice(0, 5).map((entry) => {
                const isMe =
                  String(entry.userId) === String(user._id);
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 transition-colors",
                      isMe && "bg-primary/10 dark:bg-primary/5",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 text-center font-mono text-xs font-black",
                        entry.rank === 1 && "text-amber-400",
                        entry.rank === 2 && "text-zinc-400",
                        entry.rank === 3 && "text-amber-700",
                        entry.rank > 3 && "text-muted-foreground/40",
                      )}
                    >
                      {entry.rank <= 3 ? (
                        <Crown className="size-3.5 mx-auto fill-current" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                    <Avatar className="size-7 border border-border/80 dark:border-border/40">
                      <AvatarImage src={entry.avatar ?? ""} />
                      <AvatarFallback className="text-[8px] font-black bg-card">
                        {entry.handle.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "flex-1 text-xs font-black truncate",
                        isMe ? "text-primary" : "text-foreground/80",
                      )}
                    >
                      {entry.handle}
                      {isMe && (
                        <span className="ml-1.5 text-[8px] font-black uppercase text-primary/75 dark:text-primary/50">
                          you
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-black text-emerald-400 tabular-nums">
                      {entry.totalXp.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </m.div>
      )}
    </div>
  );
}

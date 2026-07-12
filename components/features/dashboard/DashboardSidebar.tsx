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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full font-mono text-emerald-400">
      {/* Roadmap Progress Hub */}
      <m.div
        initial={{opacity: 0, scale: 0.97}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: 0.4}}
        className="w-full"
      >
        <Link href="/roadmap">
          <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] p-0 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group cursor-pointer h-full">
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
            
            {/* Card Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
              <span>SYS.ROADMAP</span>
              <span className="font-bold opacity-60">DECRYPTION_CORE</span>
            </div>

            <div className="p-6 relative z-10 space-y-4">
              <Compass className="absolute -right-2 -top-2 size-16 opacity-[0.03] group-hover:opacity-[0.08] text-emerald-400 transition-opacity" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass size={14} className="text-emerald-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Roadmap Progress
                  </h3>
                </div>
                <ChevronRight className="size-4 text-emerald-500/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              {/* Stat mini-grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-emerald-500/15 bg-emerald-950/10 p-3 text-center">
                  <Zap className="size-4 mx-auto mb-1.5 text-emerald-400" />
                  <p className="text-lg font-black tabular-nums leading-none text-emerald-300 glow-text-emerald">
                    {roadmapXp.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-bold uppercase text-emerald-500/40 mt-1">
                    XP
                  </p>
                </div>
                <div className="rounded border border-emerald-500/15 bg-emerald-950/10 p-3 text-center">
                  <Target className="size-4 mx-auto mb-1.5 text-emerald-400" />
                  <p className="text-lg font-black tabular-nums leading-none text-emerald-300 glow-text-emerald">
                    {roadmapProblemsSolved}
                  </p>
                  <p className="text-[8px] font-bold uppercase text-emerald-500/40 mt-1">
                    Solved
                  </p>
                </div>
              </div>

              {/* Current level */}
              {summary?.currentLevel && (
                <div className="rounded border border-emerald-500/15 bg-emerald-950/20 p-3 flex items-center gap-3">
                  <Shield className="size-5 text-emerald-400 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40">
                      Current Level
                    </p>
                    <p className="text-xs font-bold text-emerald-300 truncate">
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
      <m.div
        initial={{opacity: 0, scale: 0.97}}
        animate={{opacity: 1, scale: 1}}
        transition={{delay: 0.5}}
        className="w-full"
      >
        <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] p-0 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group h-full">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
          
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
            <span>SYS.TARGET</span>
            <span className="font-bold opacity-60">IDENTIFICATION_MODULE</span>
          </div>

          <div className="p-6 relative z-10 space-y-4">
            <Target
              size={80}
              className="absolute bottom-[-10px] right-[-10px] opacity-[0.03] text-emerald-400 group-hover:scale-110 transition-transform"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-emerald-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
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
                      className="size-6 rounded border border-emerald-500/20 bg-emerald-950/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-[#060a08] transition-all"
                    >
                      <Info size={11} aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent
                      side="top"
                      className="bg-[#0b120f]/95 font-mono text-emerald-400 border border-emerald-500/35 p-3 rounded shadow-2xl max-w-[220px] z-[9999]"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
                        Training Guide
                      </p>
                      <p className="text-[9px] leading-relaxed text-emerald-500/70 mt-1">
                        Practice problems in the{" "}
                        <span className="text-emerald-400 font-bold">
                          +100 to +300
                        </span>{" "}
                        range above your rating for optimal growth.
                      </p>
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>

            <p className="text-emerald-300/80 font-mono text-xs leading-relaxed">
              Target difficulty range:<br />
              <span className="text-emerald-400 font-bold tabular-nums text-sm glow-text-emerald">
                &gt; {user.rating + 100} – {user.rating + 300}
              </span>
            </p>
            
            <Button
              asChild
              className="w-full h-10 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/20 hover:text-emerald-300 active:scale-[0.98] transition-all font-mono"
            >
              <Link href="/training">[ RUN RECOMMENDED_SESSION.SH ]</Link>
            </Button>
          </div>
        </Card>
      </m.div>

      {/* Leaderboard Preview */}
      <m.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.6}}
        className="w-full"
      >
        <Card className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#060a08] shadow-[0_0_20px_rgba(16,185,129,0.05)] p-0 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300 group h-full">
          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.12]" />
          
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/15 bg-[#0b120f] select-none text-[8px] text-emerald-500/55">
            <span>SYS.LEADERBOARD</span>
            <span className="font-bold opacity-60">GLOBAL_NODE_LEADERBOARD</span>
          </div>

          <div className="p-0 relative z-10 divide-y divide-emerald-500/10">
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 3).map((entry, idx) => {
                const isMe = String(entry.userId) === String(user._id);
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-2.5 px-4 py-2.5 text-[11px]",
                      isMe && "bg-emerald-950/20",
                    )}
                  >
                    <span
                      className={cn(
                        "w-5 font-mono text-[9px] font-bold text-center",
                        entry.rank === 1 && "text-amber-400 glow-text-amber",
                        entry.rank === 2 && "text-zinc-400",
                        entry.rank === 3 && "text-amber-700",
                        entry.rank > 3 && "text-emerald-500/40",
                      )}
                    >
                      {entry.rank <= 3 ? (
                        <Crown className="size-3 mx-auto fill-current" />
                      ) : (
                        `#${entry.rank}`
                      )}
                    </span>
                    
                    <span className="text-[8px] opacity-40 font-mono">NODE_0{idx + 1}</span>

                    <Avatar className="size-6 border border-emerald-500/20 rounded">
                      <AvatarImage src={entry.avatar ?? ""} />
                      <AvatarFallback className="text-[7px] font-bold bg-[#060a08] text-emerald-400">
                        {entry.handle.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <span
                      className={cn(
                        "flex-1 font-bold truncate tracking-tight text-[11px]",
                        isMe ? "text-emerald-400 glow-text-emerald" : "text-emerald-300/80",
                      )}
                    >
                      {entry.handle}
                      {isMe && (
                        <span className="ml-1 text-[7px] font-black uppercase text-emerald-400/50">
                          (YOU)
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 glow-text-emerald tabular-nums">
                      {entry.totalXp.toLocaleString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-emerald-500/40">
                [NO ACTIVE CONNECTED NODES]
              </div>
            )}
            
            {/* View rankings shortcut button */}
            <div className="p-3 bg-[#0b120f]/50 flex justify-center">
              <Link
                href="/leaderboard"
                className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-1 group-hover:glow-text-emerald"
              >
                [ VIEW ALL GLOBAL NODES ] <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        </Card>
      </m.div>
    </div>
  );
}


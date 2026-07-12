"use client";

import { Activity, Flame, Zap, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";

interface ConsoleAccountCardProps {
  user: any;
  logout: () => void;
}

export function ConsoleAccountCard({ user, logout }: ConsoleAccountCardProps) {
  return (
    <div className="font-mono text-emerald-400 space-y-6 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wider">SYS.SECURITY // ACCESS CONTROL CFG</span>
        </div>
        <span className="text-[10px] tracking-widest font-black uppercase text-emerald-500/50">SYSTEM_CTRL</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Info panel */}
        <div className="space-y-4 bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-xl">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/40">
            Node Status Readout
          </span>
          <div className="space-y-2 text-[10px] text-emerald-500/80 font-mono">
            <div className="flex justify-between py-1 border-b border-emerald-500/10">
              <span>CF HANDLE</span>
              <span className="text-emerald-300 font-bold">{user.codeforcesHandle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-500/10">
              <span>ROLE DIV</span>
              <span className="text-emerald-400 font-bold uppercase">ROLE_{user.role?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-emerald-500/10">
              <span>LAST ACTIVE</span>
              <span className="text-emerald-300">
                {user.lastSyncTime ? new Date(user.lastSyncTime).toLocaleDateString() : "Just now"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>CREATION CODE</span>
              <span className="text-emerald-500/60">#{user._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4 bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-xl">
          <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/40 block mb-1">
            [ ACTION PROTOCOLS ]
          </span>
          <ChangePasswordDialog />
          <Button
            variant="outline"
            onClick={logout}
            className="w-full h-10 rounded border border-red-500/35 bg-transparent text-red-400 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 active:scale-[0.98] transition-all font-mono"
          >
            <LogOut size={13} className="mr-2" /> [ DISCONNECT.SH ]
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MilestoneProgressCardProps {
  user: any;
  milestone: {
    name: string;
    target: number;
    color: string;
    bg: string;
    border: string;
    band: string;
  };
  rating: number;
  progressPercent: number;
  ratingDiff: number;
}

export function MilestoneProgressCard({
  user,
  milestone,
  rating,
  progressPercent,
  ratingDiff,
}: MilestoneProgressCardProps) {
  const totalBlocks = 18;
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((progressPercent / 100) * totalBlocks)));
  const emptyBlocks = totalBlocks - filledBlocks;
  const progressBlocks = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <div className="font-mono text-emerald-400 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <span className="font-semibold tracking-wider">SYS.MILESTONES // BAND_PROGRESS</span>
        <span className="text-[10px] tracking-widest font-black uppercase text-emerald-500/50">BAND_PROGRESS</span>
      </div>

      <div className="space-y-4 bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-xl">
        <div className="space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
            Milestone Progress
          </span>
          <h3 className="text-sm font-black uppercase tracking-tight text-emerald-400">
            CF Ranking Level
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Target Rank: {milestone.name}</span>
            <span className="tabular-nums">{rating} / {milestone.target}</span>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] tracking-tight font-mono text-emerald-400 glow-text-emerald select-none">
              [{progressBlocks}] {Math.round(progressPercent)}%
            </div>
          </div>

          <div className="flex justify-between text-[8px] font-bold text-emerald-500/50 uppercase">
            <span>Current ({rating})</span>
            <span>{ratingDiff > 0 ? `${ratingDiff} rating left` : "Milestone Reached"}</span>
          </div>
        </div>

        <div className="p-3 bg-emerald-950/20 border border-emerald-500/15 rounded text-[10px] text-emerald-500/70 leading-relaxed font-mono">
          Climb to <span className="font-bold text-emerald-400">{milestone.target}</span> to advance from <span className="font-bold text-emerald-300">{user.rank || "Recruit"}</span> to the next tier band.
        </div>
      </div>
    </div>
  );
}

interface StreaksCardProps {
  streaks: {
    trainingStreak: number;
    upsolveStreak: number;
    bestStreak: number;
    consistencyScore: number;
  } | null;
}

export function StreaksCard({ streaks }: StreaksCardProps) {
  return (
    <div className="font-mono text-emerald-400 space-y-4 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/15 select-none text-xs text-emerald-500/60">
        <span className="font-semibold tracking-wider">SYS.STREAKS // CONGRUENCE_MONITOR</span>
        {streaks && (
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border",
            streaks.consistencyScore >= 70
              ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
              : streaks.consistencyScore >= 40
                ? "text-amber-400 border-amber-500/20 bg-amber-950/20"
                : "text-emerald-500/50 border-emerald-500/10 bg-transparent"
          )}>
            CONSISTENCY: {streaks.consistencyScore}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-xl">
        <div className="rounded border border-emerald-500/15 bg-emerald-950/10 p-3 text-center">
          <Flame className="size-4 mx-auto mb-1 text-orange-400" />
          <p className="text-lg font-black tabular-nums leading-none text-emerald-300 glow-text-emerald">
            {streaks?.trainingStreak ?? 0}
          </p>
          <p className="text-[7px] font-bold uppercase text-emerald-500/40 mt-1">Training</p>
        </div>
        <div className="rounded border border-emerald-500/15 bg-emerald-950/10 p-3 text-center">
          <Zap className="size-4 mx-auto mb-1 text-amber-400 animate-pulse" />
          <p className="text-lg font-black tabular-nums leading-none text-emerald-300 glow-text-emerald">
            {streaks?.upsolveStreak ?? 0}
          </p>
          <p className="text-[7px] font-bold uppercase text-emerald-500/40 mt-1">Upsolve</p>
        </div>
        <div className="rounded border border-emerald-500/15 bg-emerald-950/10 p-3 text-center">
          <Crown className="size-4 mx-auto mb-1 text-emerald-400" />
          <p className="text-lg font-black tabular-nums leading-none text-emerald-300 glow-text-emerald">
            {streaks?.bestStreak ?? 0}
          </p>
          <p className="text-[7px] font-bold uppercase text-emerald-500/40 mt-1">Best</p>
        </div>
      </div>
    </div>
  );
}

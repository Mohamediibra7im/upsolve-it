"use client";

import { Activity, Flame, Zap, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StudioProgress from "./StudioProgress";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";

interface ConsoleAccountCardProps {
  user: any;
  logout: () => void;
}

export function ConsoleAccountCard({ user, logout }: ConsoleAccountCardProps) {
  return (
    <div className="font-sans text-primary space-y-6 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-primary" />
          <span className="font-semibold">Account settings</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">Settings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Info panel */}
        <div className="space-y-4 bg-card border border-border p-5 rounded-2xl">
          <span className="text-xs font-medium text-muted-foreground">
            Account details
          </span>
          <div className="space-y-2 text-sm text-muted-foreground font-sans">
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-1 border-b border-border">
              <span>Codeforces handle</span>
              <span className="text-foreground font-medium">{user.codeforcesHandle}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-1 border-b border-border">
              <span>Role</span>
              <span className="text-primary font-medium">{user.role}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-1 border-b border-border">
              <span>Last active</span>
              <span className="text-foreground">
                {user.lastSyncTime ? new Date(user.lastSyncTime).toLocaleDateString() : "Just now"}
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-1">
              <span>Account ID</span>
              <span className="text-muted-foreground">#{user._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4 bg-card border border-border p-5 rounded-2xl">
          <span className="text-xs font-medium text-muted-foreground block mb-1">
            Account actions
          </span>
          <ChangePasswordDialog />
          <Button
            variant="outline"
            onClick={logout}
            className="w-full h-10 rounded-lg border border-red-500/35 bg-transparent text-red-400 font-medium text-xs hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 active:scale-[0.98] transition-all font-sans"
          >
            <LogOut size={13} className="mr-2" /> Sign out
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

  return (
    <div className="font-sans text-primary space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
        <span className="font-semibold">Your next milestone</span>
        <span className="text-xs font-semibold text-muted-foreground">Rating progress</span>
      </div>

      <div className="space-y-4 bg-card border border-border p-5 rounded-2xl">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Milestone Progress
          </span>
          <h3 className="font-semibold tracking-tight text-primary font-heading text-lg">
            The next step in your rating
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-foreground">
            <span>Target rank: {milestone.name}</span>
            <span className="tabular-nums">{rating} / {milestone.target}</span>
          </div>

          <div className="space-y-1">
            <StudioProgress value={progressPercent} label="Rating milestone progress" />
          </div>

          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Current ({rating})</span>
            <span>{ratingDiff > 0 ? `${ratingDiff} rating left` : "Milestone reached"}</span>
          </div>
        </div>

        <div className="p-3 bg-card border border-border rounded-lg text-xs text-muted-foreground leading-relaxed font-sans">
          Climb to <span className="font-medium text-primary">{milestone.target}</span> to advance from <span className="font-medium text-foreground">{user.rank || "Recruit"}</span> to your next rank.
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
    <div className="font-sans text-primary space-y-4 w-full">
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
        <span className="font-semibold">Consistency</span>
        {streaks && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-lg border",
            streaks.consistencyScore >= 70
              ? "text-primary border-border bg-card"
              : streaks.consistencyScore >= 40
                ? "text-amber-400 border-amber-500/20 bg-amber-950/20"
                : "text-muted-foreground border-border bg-transparent"
          )}>
            Consistency: {streaks.consistencyScore}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-card border border-border p-3 rounded-2xl">
        <div className="rounded-lg border border-border bg-card px-1 py-4 text-center">
          <Flame className="size-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
            {streaks?.trainingStreak ?? 0}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">Training</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-1 py-4 text-center">
          <Zap className="size-4 mx-auto mb-1 text-amber-400" />
          <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
            {streaks?.upsolveStreak ?? 0}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">Upsolve</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-1 py-4 text-center">
          <Crown className="size-4 mx-auto mb-1 text-primary" />
          <p className="text-lg font-semibold tabular-nums leading-none text-foreground">
            {streaks?.bestStreak ?? 0}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-1">Best</p>
        </div>
      </div>
    </div>
  );
}

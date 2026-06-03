"use client";

import { m } from "framer-motion";
import { Activity, Flame, Zap, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";

interface SidebarCardsProps {
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
  streaks: {
    trainingStreak: number;
    upsolveStreak: number;
    bestStreak: number;
    consistencyScore: number;
  } | null;
  logout: () => void;
}

export default function SidebarCards({
  user,
  milestone,
  rating,
  progressPercent,
  ratingDiff,
  streaks,
  logout,
}: SidebarCardsProps) {
  return (
    <div className="xl:col-span-4 space-y-6">
      <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
            System Console
          </span>
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
            <Activity size={10} className="animate-pulse" /> Online
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-[11px] text-muted-foreground/90">
          <div className="flex justify-between py-1 border-b border-border/30">
            <span>CF HANDLE</span>
            <span className="text-foreground font-semibold">{user.codeforcesHandle}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/30">
            <span>ROLE DIV</span>
            <span className="text-primary font-bold uppercase">{user.role}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/30">
            <span>LAST ACTIVE</span>
            <span className="text-foreground">
              {user.lastSyncTime ? new Date(user.lastSyncTime).toLocaleDateString() : "Just now"}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span>CREATION CODE</span>
            <span className="text-foreground/70">#{user._id.slice(-6).toUpperCase()}</span>
          </div>
        </div>
      </Card>

      <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-5">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Milestone Progress
          </span>
          <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
            CF Ranking Level
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Target Rank: {milestone.name}</span>
            <span className="text-foreground tabular-nums">{rating} / {milestone.target}</span>
          </div>

          <div className="h-2.5 bg-muted/60 dark:bg-muted/40 rounded-full overflow-hidden border border-border/40">
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
            />
          </div>

          <div className="flex justify-between text-[9px] font-bold text-muted-foreground/60 uppercase">
            <span>Current ({rating})</span>
            <span>{ratingDiff > 0 ? `${ratingDiff} rating left` : "Milestone Reached"}</span>
          </div>
        </div>

        <div className="p-3 bg-muted/30 dark:bg-muted/10 border border-border/30 rounded-xl text-xs text-muted-foreground/80 leading-relaxed font-medium">
          Climb to <span className="font-bold text-primary">{milestone.target}</span>{" "}
          to advance from <span className="font-bold text-foreground">{user.rank || "Recruit"}</span>{" "}
          to the next tier band.
        </div>
      </Card>

      <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
            Activity Streaks
          </span>
          {streaks && (
            <span className={cn(
              "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
              streaks.consistencyScore >= 70
                ? "text-emerald-500 bg-emerald-500/10"
                : streaks.consistencyScore >= 40
                  ? "text-amber-500 bg-amber-500/10"
                  : "text-muted-foreground bg-muted/30"
            )}>
              <Activity size={10} /> {streaks.consistencyScore}%
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
            <Flame className="size-4 mx-auto mb-1 text-orange-400" />
            <p className="text-lg font-black tabular-nums leading-none text-foreground">
              {streaks?.trainingStreak ?? 0}
            </p>
            <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">Training</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
            <Zap className="size-4 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-black tabular-nums leading-none text-foreground">
              {streaks?.upsolveStreak ?? 0}
            </p>
            <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">Upsolve</p>
          </div>
          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
            <Crown className="size-4 mx-auto mb-1 text-emerald-400" />
            <p className="text-lg font-black tabular-nums leading-none text-foreground">
              {streaks?.bestStreak ?? 0}
            </p>
            <p className="text-[7px] font-black uppercase text-muted-foreground/60 mt-1">Best</p>
          </div>
        </div>
      </Card>

      <Card className="border-border/60 dark:border-border/40 bg-card/25 backdrop-blur-xl rounded-2xl p-5 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          Account
        </h3>
        <ChangePasswordDialog />
        <Button
          variant="outline"
          onClick={logout}
          className="w-full h-11 rounded-xl border-border/80 hover:border-red-500/40 dark:border-border/40 bg-background/40 font-black uppercase tracking-widest text-[9px] hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={14} className="mr-2" /> Log Out
        </Button>
      </Card>
    </div>
  );
}

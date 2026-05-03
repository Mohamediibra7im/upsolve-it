"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  RefreshCw,
  LogOut,
  Target,
  Sparkles,
  Trophy,
  Flame,
  LayoutGrid,
  Info,
  Zap,
  Users,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import Loader from "@/app/_Components/Loader";
import ChangePasswordDialog from "@/app/_Components/ChangePasswordDialog";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import ActivityHeatmap from "@/app/_Components/ActivityHeatmap";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function HomePage() {
  const { user, isLoading: isUserLoading, logout, syncProfile } = useUser();
  const { incoming: incomingFriendRequests } = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const { history, isLoading: isHistoryLoading } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading } = useUpsolvedProblems();
  const { totalSolved } = useHeatmapData(history || [], upsolvedProblems || []);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const { data: streaks } = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    { revalidateOnFocus: false },
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncProfile();
    setIsSyncing(false);
  };

  if (isUserLoading || isHistoryLoading || isUpsolveLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Dashboard Connected
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase leading-[0.95]"
          >
            Welcome Back,<br />
            <span className="text-primary">{user.codeforcesHandle}</span>
          </motion.h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:flex-nowrap">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="h-12 md:h-14 flex-1 min-w-[120px] md:px-6 rounded-xl md:rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-card/40 transition-all"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Updating..." : "Sync Profile"}
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 md:h-14 flex-1 min-w-[120px] md:px-6 rounded-xl md:rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-card/40 transition-all"
          >
            <Link href="/friends" className="relative flex items-center justify-center gap-2">
              <Users className="h-4 w-4" />
              Friends
              {friendRequestCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-none text-white shadow-sm ring-2 ring-background"
                  aria-label={`${friendRequestCount} pending friend request${friendRequestCount === 1 ? "" : "s"}`}
                >
                  {friendRequestCount > 9 ? "9+" : friendRequestCount}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild className="h-12 md:h-14 flex-1 min-w-[120px] md:px-8 rounded-xl md:rounded-2xl bg-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-lg shadow-primary/20 transition-all">
            <Link href="/training">Start Training</Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Current Rating", value: user.rating || 0, sub: user.rank || "Newbie", icon: Trophy, color: "text-yellow-500" },
          { label: "Max Rating", value: user.maxRating || 0, sub: user.maxRank || "Newbie", icon: Sparkles, color: "text-primary" },
          { label: "Solved Count", value: totalSolved, sub: "Problems", icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Total Sessions", value: history?.length || 0, sub: "Completed", icon: Flame, color: "text-orange-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] p-6 hover:bg-card/30 transition-colors group overflow-hidden relative">
              <stat.icon className={cn("absolute top-[-10px] right-[-10px] h-20 w-20 opacity-5 group-hover:opacity-10 transition-opacity", stat.color)} />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">{stat.label}</p>
              <h4 className="text-4xl font-black tracking-tight mb-1">{stat.value}</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{stat.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Streak metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "Training streak",
            value: streaks?.trainingStreak ?? "-",
            sub: "days with a session",
            icon: Zap,
            color: "text-amber-500",
          },
          {
            label: "Upsolve streak",
            value: streaks?.upsolveStreak ?? "-",
            sub: "days with a solve",
            icon: Target,
            color: "text-sky-500",
          },
          {
            label: "Best streak",
            value: streaks?.bestStreak ?? "-",
            sub: "training or upsolve",
            icon: Trophy,
            color: "text-orange-500",
          },
          {
            label: "Consistency",
            value:
              streaks != null ? `${streaks.consistencyScore}%` : "-",
            sub: "last 7 days (UTC)",
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] p-6 hover:bg-card/30 transition-colors group overflow-hidden relative">
              <stat.icon
                className={cn(
                  "absolute top-[-10px] right-[-10px] h-20 w-20 opacity-5 group-hover:opacity-10 transition-opacity",
                  stat.color,
                )}
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                {stat.label}
              </p>
              <h4 className="text-4xl font-black tracking-tight mb-1">
                {stat.value}
              </h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {stat.sub}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Heatmap */}
        <Card className="lg:col-span-2 border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid size={20} className="text-primary" />
              <h3 className="text-xl font-black uppercase tracking-tight">Activity History</h3>
            </div>
            <Link href="/statistics" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Analytics</Link>
          </div>
          <div className="p-8 overflow-x-auto">
            <ActivityHeatmap history={history || []} upsolvedProblems={upsolvedProblems || []} />
          </div>
        </Card>

        {/* Quick Actions & Settings */}
        <div className="space-y-6">
          {/* Gamified Neuro-Sync Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />

              {/* Pulsing Neural Core Animation */}
              <div className="absolute -right-4 -top-4 w-32 h-32 opacity-20 group-hover:opacity-40 transition-opacity">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_10s_linear_infinite]">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10 5" className="text-primary" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 10" className="text-primary/60" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="1 4" className="text-primary" />
                </svg>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">User Stats</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-[1000] tracking-tighter text-foreground uppercase">Level</span>
                    <span className="text-5xl font-[1000] tracking-tighter text-primary italic">
                      {Math.floor(Math.sqrt(totalSolved / 2)) + 1}
                    </span>
                  </div>
                </div>

                {/* Intelligence Protocol (XP Guide) */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Info size={12} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Training Points</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase text-muted-foreground/60">Training Session</span>
                      <span className="text-[9px] font-black text-emerald-500">+5 XP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase text-muted-foreground/60">Upsolve Problem</span>
                      <span className="text-[9px] font-black text-emerald-500">+2 XP</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Progress</span>
                    <span>{Math.floor(((totalSolved % 10) / 10) * 100)}% to Next Level</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalSolved % 10) * 10}%` }}
                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    />
                  </div>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            </Card>
          </motion.div>

          <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
            <Target size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 text-emerald-500 group-hover:scale-110 transition-transform" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Target size={16} className="text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">Recommended Goal</h3>
                </div>

                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        title="Training guide"
                        aria-label="Training guide: how recommended goals work"
                        className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <Info size={14} aria-hidden />
                      </button>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent
                        side="left"
                        className="bg-card/95 backdrop-blur-2xl border-white/10 p-4 rounded-xl shadow-2xl max-w-[240px] z-[9999]"
                      >
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Training Guide</p>
                          <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                            The system analyzes your baseline rating and identifies the <span className="text-foreground font-bold">+100 to +300</span> range as your optimal growth zone. These problems are hard enough to improve your skills but achievable enough to maintain momentum.
                          </p>
                        </div>
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className="text-foreground/80 font-medium leading-relaxed">
                Your current trajectory suggests a Practice Session in the{" "}
                <span className="text-emerald-500 font-black px-2 tabular-nums">
                  {user.rating + 100} - {user.rating + 300}
                </span>{" "}
                range.
              </p>
              <Button asChild className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 active:translate-y-0">
                <Link href="/training">Start Recommended Session</Link>
              </Button>
            </div>

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full -mr-10 -mt-10" />
          </Card>

          <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Account Systems</h3>
            <ChangePasswordDialog />
            <Button
              variant="outline"
              onClick={logout}
              className="w-full h-12 rounded-xl border-border/40 bg-background/40 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 transition-all"
            >
              <LogOut size={16} className="mr-2" /> Log Out
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

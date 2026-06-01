"use client";

import {useState} from "react";
import Link from "next/link";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {
  CheckCircle2,
  RefreshCw,
  Target,
  Sparkles,
  Trophy,
  Flame,
  LayoutGrid,
  Info,
  Zap,
  Users,
  Crown,
  Compass,
  ChevronRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import {useFriendRequests} from "@/hooks/useFriendRequests";
import Loader from "@/components/shared/Loader";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import ActivityHeatmap from "@/components/shared/ActivityHeatmap";
import {useHeatmapData} from "@/hooks/useHeatmapData";
import {cn} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import useSWR from "swr";
import {swrFetcher} from "@/lib/apiClient";
import {useRoadmapUserSummary, useRoadmapLeaderboard} from "@/hooks/useRoadmap";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

type StreakPayload = {
  trainingStreak: number;
  upsolveStreak: number;
  bestStreak: number;
  consistencyScore: number;
};

export default function Dashboard() {
  const {user, isLoading: isUserLoading, logout, syncProfile} = useUser();
  const {incoming: incomingFriendRequests} = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const {history, isLoading: isHistoryLoading} = useHistory();
  const {upsolvedProblems, isLoading: isUpsolveLoading} = useUpsolvedProblems();
  const {totalSolved} = useHeatmapData(history || [], upsolvedProblems || []);
  const [isSyncing, setIsSyncing] = useState(false);

  const {summary} = useRoadmapUserSummary(!!user);
  const {leaderboard} = useRoadmapLeaderboard();

  const {data: streaks} = useSWR<StreakPayload>(
    user ? "/api/users/me/streaks" : null,
    swrFetcher,
    {revalidateOnFocus: false},
  );

  const handleSync = async () => {
    setIsSyncing(true);
    await syncProfile();
    setIsSyncing(false);
  };

  // Find user rank on the leaderboard
  const myRank = leaderboard?.find(
    (entry) => String(entry.userId) === String(user?._id),
  );

  if (isUserLoading || isHistoryLoading || isUpsolveLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (!user) return null;

  const roadmapXp = summary?.totalXp ?? 0;
  const roadmapRank = myRank?.rank ?? 0;
  const roadmapProblemsSolved = summary?.problemsSolved ?? 0;
  const roadmapTopicsCompleted = summary?.topicsCompleted ?? 0;

  // XP level calculation
  const xpLevel = Math.floor(roadmapXp / 500) + 1;
  const xpProgress = ((roadmapXp % 500) / 500) * 100;
  const xpToNext = 500 - (roadmapXp % 500);

  // Dynamic title based on XP
  const xpTitle =
    roadmapXp > 5000
      ? "Legend"
      : roadmapXp > 3000
        ? "Champion"
        : roadmapXp > 1500
          ? "Strategist"
          : roadmapXp > 500
            ? "Tactician"
            : "Novice";

  return (
    <div className="space-y-10">
      {/* ─── HERO SECTION ─── */}
      <motion.section
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.6}}
        className="relative overflow-hidden rounded-[2.5rem] border border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl"
      >
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-amber-500/5 blur-[120px]" />
        </div>

        <div className="relative z-10 p-8 sm:p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            {/* Left: User Info + XP Ring */}
            <div className="flex items-center gap-6 sm:gap-8 flex-1 min-w-0">
              {/* XP Ring */}
              <div className="relative shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="h-24 w-24 sm:h-28 sm:w-28 -rotate-90"
                >
                  {/* Background circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted/20 dark:text-white/5"
                  />
                  {/* Progress arc */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="url(#xpGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    initial={{strokeDashoffset: 2 * Math.PI * 52}}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 52 * (1 - xpProgress / 100),
                    }}
                    transition={{duration: 1.2, ease: "easeOut"}}
                  />
                  <defs>
                    <linearGradient
                      id="xpGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Level number inside ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 dark:text-muted-foreground/60">
                    LVL
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-primary tabular-nums leading-none">
                    {xpLevel}
                  </span>
                </div>
              </div>

              {/* User details */}
              <div className="min-w-0 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-[0.2em]">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {xpTitle}
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-none truncate">
                  {user.codeforcesHandle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <span className="font-black text-foreground tabular-nums">
                      {roadmapXp.toLocaleString()}
                    </span>{" "}
                    XP
                  </span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-black text-foreground tabular-nums">
                      {xpToNext}
                    </span>{" "}
                    to next level
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                className="h-11 px-5 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[9px] hover:bg-card/40 transition-all"
              >
                <RefreshCw
                  className={cn("mr-2 h-3.5 w-3.5", isSyncing && "animate-spin")}
                />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 rounded-2xl border-border/40 font-black uppercase tracking-widest text-[9px] hover:bg-card/40 transition-all relative"
              >
                <Link href="/friends" className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Friends
                  {friendRequestCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black leading-none text-white ring-2 ring-background">
                      {friendRequestCount > 9 ? "9+" : friendRequestCount}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 px-6 rounded-2xl bg-primary font-black uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                <Link href="/training">Start Training</Link>
              </Button>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-8 space-y-2">
            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/50">
              <span>Level {xpLevel}</span>
              <span>{Math.round(xpProgress)}%</span>
              <span>Level {xpLevel + 1}</span>
            </div>
            <div className="h-2 w-full bg-muted/60 dark:bg-white/5 rounded-full overflow-hidden border border-border/40 dark:border-white/5">
              <motion.div
                initial={{width: 0}}
                animate={{width: `${xpProgress}%`}}
                transition={{duration: 1, ease: "easeOut"}}
                className="h-full bg-gradient-to-r from-primary/60 via-primary to-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Codeforces Rating",
            value: user.rating || 0,
            sub: user.rank || "Newbie",
            icon: Trophy,
            color: "text-amber-400",
            glow: "from-amber-500/10",
          },
          {
            label: "Max Rating",
            value: user.maxRating || 0,
            sub: user.maxRank || "Newbie",
            icon: Sparkles,
            color: "text-primary",
            glow: "from-primary/10",
          },
          {
            label: "Problems Solved",
            value: totalSolved,
            sub: `${roadmapProblemsSolved} via Roadmap`,
            icon: CheckCircle2,
            color: "text-emerald-400",
            glow: "from-emerald-500/10",
          },
          {
            label: "Sessions",
            value: history?.length || 0,
            sub: `${roadmapTopicsCompleted} topics done`,
            icon: Flame,
            color: "text-orange-400",
            glow: "from-orange-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.1 + i * 0.08}}
          >
            <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[1.8rem] p-5 hover:bg-card/80 dark:hover:bg-card/30 transition-all duration-300 group overflow-hidden relative h-full">
              <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.glow)} />
              <stat.icon
                className={cn(
                  "absolute -top-2 -right-2 h-16 w-16 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity",
                  stat.color,
                )}
              />
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 mb-3">
                  {stat.label}
                </p>
                <h4 className="text-3xl font-black tracking-tight mb-0.5 tabular-nums">
                  {stat.value}
                </h4>
                <p className="text-[9px] font-bold text-muted-foreground/75 dark:text-muted-foreground/50 uppercase">
                  {stat.sub}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ─── STREAK + RANK ROW ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Streaks */}
        {[
          {
            label: "Training Streak",
            value: streaks?.trainingStreak ?? 0,
            icon: Zap,
            color: "text-amber-400",
          },
          {
            label: "Upsolve Streak",
            value: streaks?.upsolveStreak ?? 0,
            icon: Target,
            color: "text-sky-400",
          },
          {
            label: "Best Streak",
            value: streaks?.bestStreak ?? 0,
            icon: Flame,
            color: "text-orange-400",
          },
          {
            label: "Consistency",
            value:
              streaks != null ? `${streaks.consistencyScore}%` : "—",
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.3 + i * 0.05}}
          >
            <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[1.8rem] p-5 hover:bg-card/80 dark:hover:bg-card/30 transition-all duration-300 group overflow-hidden relative h-full">
              <s.icon
                className={cn(
                  "absolute -top-1 -right-1 h-14 w-14 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity",
                  s.color,
                )}
              />
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 dark:text-muted-foreground/60 mb-3">
                  {s.label}
                </p>
                <h4 className="text-2xl font-black tracking-tight tabular-nums">
                  {s.value}
                </h4>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Leaderboard Rank Card */}
        <motion.div
          initial={{opacity: 0, y: 15}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.5}}
        >
          <Link href="/roadmap/leaderboard">
            <Card className="border-primary/30 dark:border-primary/20 bg-gradient-to-br from-primary/5 via-card/70 dark:via-card/20 to-emerald-500/5 backdrop-blur-xl rounded-[1.8rem] p-5 hover:border-primary/40 transition-all duration-300 group overflow-hidden relative cursor-pointer h-full">
              <Crown className="absolute -top-1 -right-1 h-14 w-14 opacity-[0.06] group-hover:opacity-[0.12] text-amber-400 transition-opacity" />
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary/80 dark:text-primary/60 mb-3">
                  Leaderboard
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[9px] font-black text-muted-foreground/70 dark:text-muted-foreground/50">
                    #
                  </span>
                  <h4 className="text-2xl font-black tracking-tight text-primary tabular-nums">
                    {roadmapRank || "—"}
                  </h4>
                </div>
                <p className="text-[9px] font-bold text-primary/70 dark:text-primary/40 uppercase mt-0.5 flex items-center gap-1 group-hover:text-primary/90 transition-colors">
                  View Rankings <ChevronRight className="h-3 w-3" />
                </p>
              </div>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* ─── MAIN CONTENT: HEATMAP + SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Heatmap (large) */}
        <Card className="lg:col-span-2 border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-border/60 dark:border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <LayoutGrid size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight">
                  Activity History
                </h3>
                <p className="text-[9px] font-bold text-muted-foreground/75 dark:text-muted-foreground/50 uppercase tracking-widest">
                  Training & upsolve timeline
                </p>
              </div>
            </div>
            <Link
              href="/statistics"
              className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
            >
              Analytics <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 sm:p-8 overflow-x-auto">
            <ActivityHeatmap
              history={history || []}
              upsolvedProblems={upsolvedProblems || []}
            />
          </div>
        </Card>

        {/* Right sidebar column */}
        <div className="space-y-6">
          {/* Roadmap Progress Hub */}
          <motion.div
            initial={{opacity: 0, scale: 0.97}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: 0.4}}
          >
            <Link href="/roadmap">
              <Card className="border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <Compass className="absolute -right-3 -top-3 h-20 w-20 opacity-[0.04] group-hover:opacity-[0.08] text-primary transition-opacity" />

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
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Stat mini-grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-muted/60 dark:bg-white/[0.03] border border-border/50 dark:border-white/5 p-3 text-center">
                      <Zap className="h-4 w-4 mx-auto mb-1.5 text-primary" />
                      <p className="text-lg font-black tabular-nums leading-none">
                        {roadmapXp.toLocaleString()}
                      </p>
                      <p className="text-[8px] font-black uppercase text-muted-foreground/80 dark:text-muted-foreground/40 mt-1">
                        XP
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/60 dark:bg-white/[0.03] border border-border/50 dark:border-white/5 p-3 text-center">
                      <Target className="h-4 w-4 mx-auto mb-1.5 text-emerald-400" />
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
                      <Shield className="h-5 w-5 text-primary shrink-0" />
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
          </motion.div>

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
                        className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
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
            <motion.div
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
                    href="/roadmap/leaderboard"
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                  >
                    All <ChevronRight className="h-3 w-3" />
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
                            <Crown className="h-3.5 w-3.5 mx-auto fill-current" />
                          ) : (
                            `#${entry.rank}`
                          )}
                        </span>
                        <Avatar className="h-7 w-7 border border-border/80 dark:border-border/40">
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
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Target,
  Sparkles,
  Trophy,
  Flame,
  LayoutGrid
} from "lucide-react";
import useUser from "@/hooks/useUser";
import Loader from "@/app/_Components/Loader";
import ChangePasswordDialog from "@/app/_Components/ChangePasswordDialog";
import useHistory from "@/hooks/useHistory";
import useUpsolvedProblems from "@/hooks/useUpsolvedProblems";
import ActivityHeatmap from "@/app/_Components/ActivityHeatmap";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isLoading: isUserLoading, logout, syncProfile } = useUser();
  const { history, isLoading: isHistoryLoading } = useHistory();
  const { upsolvedProblems, isLoading: isUpsolveLoading } = useUpsolvedProblems();
  const { totalSolved } = useHeatmapData(history || [], upsolvedProblems || []);
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

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
    return <Loader message="Accessing Neural Interface..." />;
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
            Neural Link Established
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase"
          >
            Welcome Back,<br />
            <span className="text-primary">{user.codeforcesHandle}</span>
          </motion.h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            className="h-14 px-8 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[10px] hover:bg-card/40"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing Logic" : "Sync Profile"}
          </Button>
          <Button asChild className="h-14 px-8 rounded-2xl bg-primary font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
            <Link href="/training">Launch Session</Link>
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Heatmap */}
        <Card className="lg:col-span-2 border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-border/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutGrid size={20} className="text-primary" />
              <h3 className="text-xl font-black uppercase tracking-tight">Activity Grid</h3>
            </div>
            <Link href="/statistics" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Analytics</Link>
          </div>
          <div className="p-8 overflow-x-auto">
            <ActivityHeatmap history={history || []} upsolvedProblems={upsolvedProblems || []} />
          </div>
        </Card>

        {/* Quick Actions & Settings */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-primary text-primary-foreground rounded-[2.5rem] p-8 relative overflow-hidden group">
            <Target size={120} className="absolute bottom-[-20px] right-[-20px] opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Next Objective</h3>
            <p className="text-primary-foreground/80 font-medium mb-6">Your current trajectory suggests a Focus Session in the {user.rating + 100} - {user.rating + 300} range.</p>
            <Button asChild variant="secondary" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px]">
              <Link href="/training">Initiate Objective</Link>
            </Button>
          </Card>

          <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Account Systems</h3>
            <ChangePasswordDialog />
            <Button 
              variant="outline" 
              onClick={logout}
              className="w-full h-12 rounded-xl border-border/40 bg-background/40 font-black uppercase tracking-widest text-[10px] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/40 transition-all"
            >
              <LogOut size={16} className="mr-2" /> Deauthorize Session
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { AdminDashboardView } from "../_Components/AdminDashboardView";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const { stats, isLoading, mutate: refreshStats } = useAdminStats();

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operational Status: Optimal</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground leading-none">
            Strategic OverSight
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl opacity-70">
            High-level metrics and growth analysis for the upsolve ecosystem.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            className="h-14 px-8 rounded-2xl bg-card/20 border-white/10 hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all shadow-2xl font-black text-xs uppercase tracking-[0.1em] group"
            onClick={() => refreshStats()}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={cn("mr-3 transition-transform group-hover:rotate-180 duration-500", isLoading && "animate-spin")} />
            Sync System Data
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AdminDashboardView 
          stats={stats}
          statsLoading={isLoading}
        />
      </motion.div>
    </>
  );
}

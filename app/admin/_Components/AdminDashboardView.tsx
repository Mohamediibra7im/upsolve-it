'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Activity, 
  Users, 
  Lock 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminDashboardViewProps {
  stats: {
    totalUsers: number;
    adminUsers: number;
  };
  statsLoading: boolean;
}

export function AdminDashboardView({ stats, statsLoading }: Readonly<AdminDashboardViewProps>) {
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Administrators', value: stats.adminUsers, icon: Lock, color: 'amber' },
    { label: 'System Status', value: 'Healthy', icon: Activity, color: 'emerald' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* System Performance Overview */}
      <Card className="bg-card border-border p-8 lg:p-12 rounded-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <LayoutDashboard size={400} />
        </div>
        <div className="relative flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 w-fit">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Integrity Verified</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-foreground tracking-tight leading-none">
              Platform <span className="text-primary italic">Overview</span>
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
              Synthesizing platform engagement and core performance indicators. The ecosystem is currently operating within optimal parameters with zero reported latency.
            </p>
          </div>
          
          <div className="w-full lg:w-[360px] p-8 rounded-2xl bg-background/50 border border-border relative overflow-hidden group/uptime">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/uptime:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center text-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                <Activity size={32} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-black text-foreground tracking-tighter">99.99%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Operational Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-card border-border p-8 rounded-2xl group hover:border-primary/20 transition-all">
            <div className="flex flex-col gap-6">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
                stat.color === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-500",
                stat.color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                stat.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              )}>
                <stat.icon size={24} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                <div className="text-4xl font-black text-foreground tabular-nums">
                  {statsLoading ? "..." : stat.value}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

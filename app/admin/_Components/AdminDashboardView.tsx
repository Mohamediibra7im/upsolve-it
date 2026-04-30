'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Activity, 
  Bell, 
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
    { label: 'Verified Recruits', value: stats.totalUsers, icon: Users, color: 'emerald' },
    { label: 'Auth Officers', value: stats.adminUsers, icon: Lock, color: 'orange' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Hero Feature */}
      <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden p-8 sm:p-12 relative">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <LayoutDashboard size={280} />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Admin Verification</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-tight">
              Platform <span className="text-primary italic">Status</span>
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto md:mx-0">
              Monitoring system-wide metrics and user engagement. All protocols are currently within optimal operating parameters.
            </p>
          </div>
          <Card className="border-border/40 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-10 min-w-[280px] border-dashed">
            <div className="text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto">
                <Activity size={32} />
              </div>
              <div>
                <div className="text-3xl font-black text-foreground tracking-tighter">99.9%</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Uptime Stability</div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/40 bg-card/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:border-primary/40 hover:shadow-2xl transition-all duration-500">
            <CardContent className="p-8 space-y-6">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110",
                stat.color === "sky" && "bg-sky-500/10 border-sky-500/20 text-sky-500",
                stat.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                stat.color === "orange" && "bg-orange-500/10 border-orange-500/20 text-orange-500"
              )}>
                <stat.icon size={28} />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</div>
                <div className="text-4xl font-black text-foreground tracking-tighter">
                  {statsLoading ? "..." : stat.value}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

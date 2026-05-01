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
    { label: 'Network Integrity', value: 'Active', icon: Activity, color: 'sky' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12"
    >
      {/* Hero Feature */}
      <Card className="border-white/5 bg-card/10 backdrop-blur-3xl rounded-[3.5rem] overflow-hidden p-8 sm:p-14 relative shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <LayoutDashboard size={400} />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-inner">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">System Command Verified</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
              Strategic <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto md:mx-0 opacity-80 leading-relaxed">
              Synthesizing user engagement and performance metrics. All core systems are performing at peak efficiency under current load.
            </p>
          </div>
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-3xl rounded-[3rem] p-12 min-w-[320px] border-dashed shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="text-center space-y-8 relative z-10">
              <div className="h-20 w-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-500/10">
                <Activity size={40} className="animate-pulse" />
              </div>
              <div>
                <div className="text-5xl font-black text-foreground tracking-tighter">99.98%</div>
                <div className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-2">Operational Uptime</div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden group hover:border-primary/30 hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-10 space-y-8">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-lg",
                stat.color === "sky" && "bg-sky-500/10 border-sky-500/20 text-sky-500 shadow-sky-500/10",
                stat.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/10",
                stat.color === "orange" && "bg-orange-500/10 border-orange-500/20 text-orange-500 shadow-orange-500/10"
              )}>
                <stat.icon size={32} />
              </div>
              <div className="space-y-2">
                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{stat.label}</div>
                <div className="text-5xl font-black text-foreground tracking-tighter">
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

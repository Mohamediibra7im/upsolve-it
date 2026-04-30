'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  activeTab: string;
  refreshStats: () => void;
  statsLoading: boolean;
}

export function AdminHeader({ activeTab, refreshStats, statsLoading }: Readonly<AdminHeaderProps>) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
          {activeTab === 'dashboard' && "Strategic Dashboard"}
          {activeTab === 'users' && "Personnel Control"}
          {activeTab === 'logs' && "System Audit"}
        </h1>
        <p className="text-sm text-muted-foreground font-medium opacity-60">
          System Status: <span className="text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Optimal Performance</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline"
          className="h-12 px-6 rounded-2xl bg-card/20 border-border/40 hover:bg-primary/10 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest"
          onClick={refreshStats}
          disabled={statsLoading}
        >
          <RefreshCw size={14} className={cn("mr-2", statsLoading && "animate-spin")} />
          Sync Data
        </Button>
      </div>
    </div>
  );
}

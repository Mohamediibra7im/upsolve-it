'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  LayoutDashboard, 
  Bell, 
  Users, 
  Database, 
  ChevronRight, 
  ChevronLeft, 
  Terminal 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminTab = "dashboard" | "users" | "logs";

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  disabled?: boolean;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  user: any;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", label: "Strategic Overview", icon: LayoutDashboard, color: "text-primary" },
  { id: "users", label: "Personnel Files", icon: Users, color: "text-emerald-500" },
  { id: "logs", label: "System Audit Logs", icon: Database, color: "text-orange-500" },
];

export function AdminSidebar({
  activeTab,
  setActiveTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  user
}: Readonly<AdminSidebarProps>) {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 100 : 320 }}
      className={cn(
        "sticky top-0 h-screen z-50 flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-3xl transition-all duration-500 ease-in-out",
        isSidebarCollapsed ? "px-4" : "px-6"
      )}
    >
      <div className="py-10 flex flex-col h-full">
        {/* Sidebar Header */}
        <div className={cn(
          "flex items-center gap-4 mb-12",
          isSidebarCollapsed ? "justify-center" : "px-2"
        )}>
          <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Shield size={28} />
          </div>
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Admin Portal</div>
              <div className="text-xl font-black text-foreground">Command</div>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-3">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              disabled={item.disabled}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "w-full transition-all duration-300 relative group overflow-hidden",
                isSidebarCollapsed ? "h-14 p-0 justify-center rounded-2xl" : "h-14 px-5 justify-start rounded-2xl",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent",
                item.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", activeTab === item.id ? item.color : "opacity-60")} />
              {!isSidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-4 font-bold text-sm tracking-tight"
                >
                  {item.label}
                </motion.span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                />
              )}
            </Button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-10 border-t border-border/20">
          <Button
            variant="ghost"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              "w-full h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5",
              isSidebarCollapsed ? "p-0 justify-center" : "px-4 justify-start"
            )}
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : (
              <>
                <ChevronLeft size={20} className="mr-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">Collapse Console</span>
              </>
            )}
          </Button>

          <div className={cn(
            "p-4 rounded-2xl bg-white/5 border border-border/40 overflow-hidden",
            isSidebarCollapsed ? "hidden" : "block"
          )}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Terminal size={14} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground truncate">{user?.codeforcesHandle}</div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Live Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

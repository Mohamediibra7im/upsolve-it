'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Database, 
  Layers,
  ChevronRight,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronLeft,
  Compass,
  Sparkles,
  Lightbulb,
  MailQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { id: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "METRICS_DUMP" },
  { id: "users", href: "/admin/users", label: "User Registry", icon: Users, desc: "ROLES_ACL" },
  { id: "levels", href: "/admin/levels", label: "Levels Setup", icon: Layers, desc: "XP_SCALING" },
  { id: "roadmap", href: "/admin/roadmap", label: "Roadmap Setup", icon: Compass, desc: "SECTOR_MAP" },
  { id: "whats-new", href: "/admin/whats-new", label: "What's New", icon: Sparkles, desc: "SYSTEM_UPDATES" },
  { id: "suggestions", href: "/admin/suggestions", label: "Suggestions", icon: Lightbulb, desc: "EXTERNAL_NODES" },
  { id: "contact", href: "/admin/contact", label: "Contact Inbox", icon: MailQuestion, desc: "SUPPORT_INBOX" },
  { id: "logs", href: "/admin/logs", label: "Audit Logs", icon: Database, desc: "JOURNAL_DUMP" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setCompact] = useState(false);
  
  const isAuthorized = user?.role === "admin";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-compact');
    if (saved) setCompact(saved === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-sidebar-compact', String(isCompact));
  }, [isCompact]);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/");
    }
  }, [user, isLoading, isAuthorized, router]);

  if (isLoading || !isAuthorized) {
    return <Loader message="AUTHENTICATING..." />;
  }

  return (
    <div className="min-h-screen bg-[#040604] text-emerald-400 flex font-mono select-none overflow-hidden relative">
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />
      
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[150] bg-[#060a08] border-r border-emerald-500/15 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCompact ? "w-20" : "w-72"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-emerald-500/15 transition-all relative", isCompact ? "px-0 justify-center" : "px-6")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-8 rounded-sm border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Shield size={16} />
            </div>
            {!isCompact && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                <div className="text-xs font-black tracking-widest text-emerald-300 uppercase leading-none">ADMIN_CONSOLE.SYS</div>
                <div className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest mt-1">SYSOP_CONTROL_ROOM</div>
              </m.div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button 
            onClick={() => setCompact(!isCompact)}
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
            className={cn(
              "hidden lg:flex absolute -right-3 top-7 size-6 items-center justify-center rounded-sm bg-[#060a08] border border-emerald-500/20 text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/40 transition-all duration-300 z-[160] shadow-xl",
              isCompact && "rotate-180"
            )}
          >
            <ChevronLeft size={12} />
          </button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
            title="Close Sidebar"
            aria-label="Close Sidebar"
            className="ml-auto lg:hidden text-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/5"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Navigation Section */}
        <TooltipProvider delayDuration={0}>
          <nav className={cn("flex-1 py-6 space-y-1 overflow-y-auto overflow-x-hidden transition-all", isCompact ? "px-2" : "px-3")}>
            {!isCompact && (
              <div className="px-3 mb-3 text-[8px] font-bold text-emerald-500/30 uppercase tracking-[0.25em]">{"// MODULES"}</div>
            )}
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Content = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center transition-all duration-200 relative rounded-sm border",
                    isCompact ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.05)]" 
                      : "text-emerald-500/50 border-transparent hover:text-emerald-300 hover:bg-emerald-950/10"
                  )}
                >
                  <item.icon size={15} className={cn("shrink-0 transition-transform group-hover:scale-105", isActive ? "opacity-100" : "opacity-50")} />
                  {!isCompact && (
                    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 leading-none">{item.label}</div>
                      <div className="text-[8px] font-bold opacity-30 tracking-widest truncate">{item.desc}</div>
                    </m.div>
                  )}
                  {isActive && !isCompact && <ChevronRight size={10} className="opacity-30" />}
                </Link>
              );

              return isCompact ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {Content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#060a08] border-emerald-500/25 text-emerald-300 font-bold text-[9px] uppercase tracking-wider rounded-sm">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.id}>{Content}</div>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* User Footer */}
        <div className={cn("border-t border-emerald-500/15 bg-black/10 transition-all", isCompact ? "p-2" : "p-4")}>
          <div className={cn("flex items-center rounded-sm bg-[#040604] border border-emerald-500/10 transition-all", isCompact ? "p-1.5 justify-center" : "gap-3 p-2.5")}>
            <div className="size-8 rounded-sm bg-emerald-950/10 border border-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold overflow-hidden shrink-0">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.codeforcesHandle} width={32} height={32} unoptimized className="size-full object-cover" />
              ) : (
                user?.codeforcesHandle?.[0].toUpperCase()
              )}
            </div>
            {!isCompact && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0 font-mono">
                <div className="text-[10px] font-bold text-emerald-300 truncate">{user?.codeforcesHandle}</div>
                <div className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-widest">SYS_ADMIN</div>
              </m.div>
            )}
          </div>
          {isCompact ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="mt-3 flex justify-center">
                    <Button variant="ghost" title="Exit Console" className="size-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/10 hover:border-red-500/30 rounded-sm border border-red-500/15 flex items-center justify-center">
                      <LogOut size={13} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-red-950 text-red-400 border border-red-500/25 font-bold text-[9px] uppercase tracking-wider rounded-sm">
                  Exit Console
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link href="/" className="block mt-3">
              <Button variant="ghost" className="w-full h-8 justify-center text-red-400 hover:text-red-300 hover:bg-red-950/10 border border-red-500/15 hover:border-red-500/30 gap-2 rounded-sm font-mono text-[9px] uppercase tracking-widest">
                <LogOut size={12} />
                <span>[ EXIT_CONSOLE.SH ]</span>
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 shrink-0 bg-[#060a08]/80 backdrop-blur-md border-b border-emerald-500/15 px-6 lg:px-8 flex items-center justify-between z-[100]">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              className={cn("lg:hidden border-emerald-500/25 text-emerald-400 bg-transparent hover:bg-emerald-500/10 rounded-sm shadow-md", isSidebarOpen && "hidden")}
            >
              <Menu size={20} />
            </Button>
            <div>
              <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-[0.25em] mb-0.5">Control // {pathname.split('/').pop()}</div>
              <h1 className="text-sm font-bold text-emerald-300 tracking-widest uppercase leading-none">
                {navItems.find(item => pathname.startsWith(item.href))?.label || pathname.split('/').pop()?.replace('-', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-9 rounded-sm border border-emerald-500/15 text-emerald-500/60 hover:text-emerald-300 bg-transparent relative hover:bg-emerald-500/5">
              <Bell size={14} />
              <div className="absolute top-2 right-2 size-1.5 bg-emerald-400 rounded-sm border border-background animate-pulse" />
            </Button>
            <div className="size-9 rounded-sm bg-emerald-950/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-2xl">
              <Shield size={16} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth bg-[#040604] relative">
          <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none" />
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

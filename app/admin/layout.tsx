'use client';

import { useEffect , useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {useUser} from "@/hooks/auth";
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
  Compass
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
  { id: "dashboard", href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Platform Metrics" },
  { id: "users", href: "/admin/users", label: "User Management", icon: Users, desc: "Registry & Roles" },
  { id: "levels", href: "/admin/levels", label: "Level Distribution", icon: Layers, desc: "Target Configuration" },
  { id: "roadmap", href: "/admin/roadmap", label: "Roadmap", icon: Compass, desc: "Levels & Sessions" },
  { id: "logs", href: "/admin/logs", label: "Audit Logs", icon: Database, desc: "Security Records" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCompact, setCompact] = useState(false);
  
  const isAuthorized = user?.role === "admin";

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
    return <Loader message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[150] bg-card border-r border-border flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:h-screen",
          isSidebarOpen ? "-translate-x-full" : "translate-x-0",
          isCompact ? "w-20" : "w-72"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-20 flex items-center border-b border-border transition-all relative", isCompact ? "px-0 justify-center" : "px-8")}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <Shield size={20} />
            </div>
            {!isCompact && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                <div className="text-sm font-black tracking-tight text-foreground uppercase leading-none">Admin Console</div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management Hub</div>
              </m.div>
            )}
          </div>
          
          {/* Toggle Button - Floating on the border */}
          <button 
            onClick={() => setCompact(!isCompact)}
            title="Toggle Sidebar"
            aria-label="Toggle Sidebar"
            className={cn(
              "hidden lg:flex absolute -right-3 top-7 size-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-all duration-300 z-[160] shadow-xl",
              isCompact && "rotate-180"
            )}
          >
            <ChevronLeft size={14} />
          </button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(false)}
            title="Close Sidebar"
            aria-label="Close Sidebar"
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Navigation Section */}
        <TooltipProvider delayDuration={0}>
          <nav className={cn("flex-1 py-8 space-y-1.5 overflow-y-auto overflow-x-hidden transition-all", isCompact ? "px-2" : "px-4")}>
            {!isCompact && (
              <div className="px-4 mb-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Console</div>
            )}
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Content = (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center transition-all duration-300 relative",
                    isCompact ? "justify-center p-3 rounded-xl" : "gap-4 px-4 py-3.5 rounded-xl",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                  )}
                >
                  <item.icon size={18} className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "opacity-100" : "opacity-60")} />
                  {!isCompact && (
                    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-none mb-1">{item.label}</div>
                      <div className="text-[9px] font-medium opacity-50 truncate">{item.desc}</div>
                    </m.div>
                  )}
                  {isActive && !isCompact && <ChevronRight size={14} className="opacity-40" />}
                </Link>
              );

              return isCompact ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {Content}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-card border-border text-foreground font-bold text-[10px]">
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
        <div className={cn("border-t border-border bg-black/5 transition-all", isCompact ? "p-3" : "p-6")}>
          <div className={cn("flex items-center rounded-2xl bg-background/50 border border-border transition-all", isCompact ? "p-2 justify-center" : "gap-3 p-3")}>
            <div className="size-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground font-black overflow-hidden shrink-0">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.codeforcesHandle} width={40} height={40} unoptimized className="size-full object-cover" />
              ) : (
                user?.codeforcesHandle?.[0].toUpperCase()
              )}
            </div>
            {!isCompact && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <div className="text-xs font-bold text-foreground truncate">{user?.codeforcesHandle}</div>
                <div className="text-[9px] font-bold text-primary uppercase tracking-widest">Active Admin</div>
              </m.div>
            )}
          </div>
          {isCompact ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/" className="mt-4 flex justify-center">
                    <Button variant="ghost" title="Exit Console" className="size-10 p-0 text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:border-destructive/20 rounded-xl border border-transparent flex items-center justify-center">
                      <LogOut size={16} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-destructive text-white border-none font-bold text-[10px]">
                  Exit Console
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link href="/" className="block mt-4">
              <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:border-destructive/20 gap-3 rounded-xl border border-transparent">
                <LogOut size={16} />
                <span className="text-xs font-bold">Exit Console</span>
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 shrink-0 bg-card/60 backdrop-blur-xl border-b border-border px-8 flex items-center justify-between z-[100]">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className={cn("lg:hidden text-muted-foreground hover:text-foreground", !isSidebarOpen && "hidden")}
            >
              <Menu size={24} />
            </Button>
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">Control / {pathname.split('/').pop()}</div>
              <h1 className="text-xl font-black text-foreground tracking-tight capitalize leading-none">
                {navItems.find(item => pathname.startsWith(item.href))?.label || pathname.split('/').pop()?.replace('-', ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:text-foreground bg-background/50 border border-border relative">
              <Bell size={18} />
              <div className="absolute top-2.5 right-2.5 size-1.5 bg-primary rounded-full border-2 border-card" />
            </Button>
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl">
              <Shield size={20} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth bg-background">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

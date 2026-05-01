'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import AdminUserManagement from "./_Components/AdminUserManagement";
import useUser from "@/hooks/useUser";
import { useAdminStats } from "@/hooks/useAdminStats";
import Loader from "@/app/_Components/Loader";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Database, 
  RefreshCw,
  Home,
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Modular components
import { AdminDashboardView } from "./_Components/AdminDashboardView";
import AdminLogsView from "./_Components/AdminLogsView";

type AdminTab = "dashboard" | "users" | "logs";

const navItems = [
  { id: "dashboard", label: "Strategic Overview", icon: LayoutDashboard, color: "text-primary" },
  { id: "users", label: "Personnel Files", icon: Users, color: "text-emerald-500" },
  { id: "logs", label: "System Audit Logs", icon: Database, color: "text-orange-500" },
];

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const { stats, isLoading: statsLoading, mutate: refreshStats } = useAdminStats();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!hasCheckedAuth) {
        setHasCheckedAuth(true);
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.role === "admin") {
              setIsAuthorized(true);
              return;
            }
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
        router.push("/");
      }
    }, 3000);

    if (!isLoading) {
      setHasCheckedAuth(true);
      if (user?.role !== "admin") {
        clearTimeout(timeoutId);
        router.push("/");
        return;
      }
      clearTimeout(timeoutId);
      setIsAuthorized(true);
    }

    return () => clearTimeout(timeoutId);
  }, [user, isLoading, router, hasCheckedAuth]);

  if ((isLoading && !hasCheckedAuth) || (!isAuthorized && !hasCheckedAuth)) {
    return <Loader message="Establishing Secure Connection..." />;
  }

  if (hasCheckedAuth && (user?.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Immersive Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-background/60 backdrop-blur-2xl">
        <div className="container max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
              <Shield size={22} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none mb-1">HQ Central</div>
              <div className="text-lg font-black text-foreground leading-none tracking-tight">Admin Console</div>
            </div>
          </div>

          {/* Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={cn(
                  "relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2.5 overflow-hidden group",
                  activeTab === item.id 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon size={16} className={cn("transition-transform group-hover:scale-110", activeTab === item.id ? "opacity-100" : "opacity-60")} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute inset-0 border border-primary/30 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* User & Actions Section */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{user?.codeforcesHandle}</div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">System Connected</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
                title="Return to App"
              >
                <Home size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <div className="w-full space-y-12">
          {/* Hero Header Area */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operational Status: Optimal</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase text-foreground leading-none">
                {activeTab === 'dashboard' && "Strategic OverSight"}
                {activeTab === 'users' && "Personnel Control"}
                {activeTab === 'logs' && "System Integrity"}
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl opacity-70">
                {activeTab === 'dashboard' && "High-level metrics and growth analysis for the upsolve ecosystem."}
                {activeTab === 'users' && "Manage identities, roles, and security permissions across the platform."}
                {activeTab === 'logs' && "Real-time audit trail and security event monitoring for system reliability."}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                className="h-14 px-8 rounded-2xl bg-card/20 border-white/10 hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all shadow-2xl font-black text-xs uppercase tracking-[0.1em] group"
                onClick={refreshStats}
                disabled={statsLoading}
              >
                <RefreshCw size={14} className={cn("mr-3 transition-transform group-hover:rotate-180 duration-500", statsLoading && "animate-spin")} />
                Sync System Data
              </Button>
            </div>
          </div>

          {/* Content Transition Views */}
          <div className="relative pt-4">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <AdminDashboardView 
                    stats={stats}
                    statsLoading={statsLoading}
                  />
                </motion.div>
              )}

              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
                    <div className="p-8 sm:p-12">
                      <AdminUserManagement />
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === "logs" && (
                <motion.div
                  key="logs"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
                    <div className="p-8 sm:p-12">
                      <AdminLogsView />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Navigation for Mobile */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <div className="p-2 rounded-[2.5rem] bg-background/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={cn(
                "p-4 rounded-full transition-all duration-300",
                activeTab === item.id 
                  ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon size={20} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

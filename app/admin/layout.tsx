'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useUser from "@/hooks/useUser";
import Loader from "@/components/shared/Loader";
import { motion } from "framer-motion";
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Database, 
  Home,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { id: "dashboard", href: "/admin/dashboard", label: "Strategic Overview", icon: LayoutDashboard },
  { id: "users", href: "/admin/users", label: "Personnel Files", icon: Users },
  { id: "levels", href: "/admin/levels", label: "Level Matrix", icon: Layers },
  { id: "logs", href: "/admin/logs", label: "System Audit Logs", icon: Database },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === "admin") {
        setIsAuthorized(true);
      } else {
        // Only redirect if we're sure the user isn't an admin
        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return <Loader message="Establishing Secure Connection..." />;
  }


  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-background/60 backdrop-blur-2xl">
        <div className="container max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
              <Shield size={22} />
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none mb-1">HQ Central</div>
              <div className="text-lg font-black text-foreground leading-none tracking-tight">Admin Console</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2.5 overflow-hidden group",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <item.icon size={16} className={cn("transition-transform group-hover:scale-110", isActive ? "opacity-100" : "opacity-60")} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 border border-primary/30 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

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
              >
                <Home size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <div className="w-full space-y-12">
           {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
        <div className="p-2 rounded-[2.5rem] bg-background/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "p-4 rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon size={20} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

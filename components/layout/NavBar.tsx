"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ModeToggle from "@/components/layout/ModeToggle";
import { 
  Menu, 
  ChevronRight, 
  Terminal, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Target, 
  LineChart, 
  Layers, 
  HelpCircle, 
  ShieldAlert,
  Home as HomeIcon
, ExternalLink } from "lucide-react";
import ClientOnly from "@/app/_Components/ClientOnly";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUser from "@/hooks/useUser";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const guestLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/help", label: "Help", icon: HelpCircle },
];

const userLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Target },
  { href: "/statistics", label: "Statistics", icon: LineChart },
  { href: "/upsolve", label: "Upsolve", icon: Layers },
  { href: "/levels", label: "Levels", icon: Target },
  { href: "/help", label: "Help", icon: HelpCircle },
];

const adminLinks = [{ href: "/admin", label: "Admin", icon: ShieldAlert }];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const baseLinks = user ? userLinks : guestLinks;
  const visibleLinks = user?.role === "admin" ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled 
          ? "h-16 bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-xl" 
          : "h-20 bg-background/0 border-b border-transparent"
      )}
    >
      <div className="container mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Logo Section - Left */}
        <div className="flex-1 flex items-center h-full">
          <Link href="/" className="group relative flex flex-col items-start py-2 overflow-visible">
            <div className="flex items-center gap-1.5 leading-none overflow-visible">
              <span className="text-primary/30 font-light text-2xl md:text-3xl tracking-tighter select-none inline-block -translate-y-[2px]">[</span>
              <div className="flex items-baseline">
                <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors duration-500">
                  UPSOLVE
                </span>
                <span className="font-black text-2xl md:text-3xl tracking-tighter bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent ml-1 pr-1">
                  .it
                </span>
                <motion.span
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    times: [0, 0.5, 0.5, 1],
                    ease: "linear" 
                  }}
                  className="inline-block w-3 h-6 md:w-4 md:h-8 bg-primary/40 ml-1 translate-y-1"
                />
              </div>
              <span className="text-primary/30 font-light text-2xl md:text-3xl tracking-tighter select-none inline-block -translate-y-[2px]">]</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <nav className="hidden lg:flex items-center justify-center flex-1 h-full gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center px-4 h-10 rounded-xl text-sm font-bold transition-all duration-300 group",
                pathname === link.href
                  ? "text-primary"
                  : "text-foreground/60 hover:text-foreground"
              )}
            >
              <span className="relative z-10">{link.label}</span>
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-primary/10 rounded-xl z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Section - Right */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
          <ClientOnly>
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none group flex items-center gap-3 bg-card/30 border border-border/40 hover:border-primary/40 hover:bg-card/50 px-2 md:px-4 py-1.5 rounded-2xl transition-all duration-300">
                      <div className="relative">
                        <Avatar className="w-8 h-8 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                          <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                          <AvatarFallback className="bg-primary/10 text-[10px] font-black uppercase">
                            {user.codeforcesHandle?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                      </div>
                      <div className="hidden md:flex flex-col items-start leading-tight">
                        <span className="text-[11px] font-black uppercase tracking-tighter">{user.codeforcesHandle}</span>
                        <span className="text-[9px] font-bold text-muted-foreground/60">{user.rank || "Recruit"}</span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl p-2">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Operator Status</p>
                        <p className="text-sm font-bold tracking-tight">{user.codeforcesHandle}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/20 mx-1" />
                    <DropdownMenuItem 
                      className="rounded-xl px-3 py-2.5 focus:bg-primary/20 focus:text-primary cursor-pointer transition-colors"
                      onClick={() => window.open(`https://codeforces.com/profile/${user.codeforcesHandle}`, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-xs font-black uppercase tracking-tight">View CF Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-xl px-3 py-2.5 focus:bg-red-500/20 focus:text-red-500 cursor-pointer text-muted-foreground/80 transition-colors"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-xs font-black uppercase tracking-tight">Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button 
                  asChild 
                  variant="ghost" 
                  className="font-bold text-xs uppercase tracking-widest px-6 rounded-xl border border-border/40 hover:border-primary/40 hover:bg-primary/10 text-foreground hover:text-primary transition-all duration-300"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="font-bold text-xs uppercase tracking-widest px-6 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105"
                >
                  <Link href="/signup">Join Community</Link>
                </Button>
              </div>
            )}
          </ClientOnly>

          <ClientOnly>
            <ModeToggle />
          </ClientOnly>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-xl bg-card/30 border border-border/40"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[320px] p-0 border-l border-border/40 bg-background/95 backdrop-blur-2xl">
                <SheetHeader className="p-8 border-b border-border/20">
                  <SheetTitle>
                    <div className="flex items-center gap-3 text-left">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Terminal size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter uppercase">Menu</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Navigation Center</span>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-100px)] justify-between p-6">
                  <div className="space-y-2">
                    {visibleLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center justify-between group p-4 rounded-2xl border transition-all duration-300",
                          pathname === link.href
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <link.icon size={18} className={cn("transition-colors", pathname === link.href ? "text-primary" : "opacity-40 group-hover:opacity-100")} />
                          <span className="text-base font-black tracking-tight">{link.label}</span>
                        </div>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-border/20">
                    {user ? (
                      <div className="p-4 rounded-2xl bg-card/30 border border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.codeforcesHandle?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-black tracking-tight uppercase">{user.codeforcesHandle}</span>
                            <span className="text-[9px] font-bold text-muted-foreground/60">{user.rating} · {user.rank}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={logout}
                          className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                        >
                          <LogOut size={18} />
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <Button asChild variant="outline" className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                          <Link href="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                        </Button>
                        <Button asChild className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary">
                          <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Join Community</Link>
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">© 2026 Upsolve.it</span>
                      <div className="flex gap-4">
                        <Settings size={14} className="text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer" />
                        <Terminal size={14} className="text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

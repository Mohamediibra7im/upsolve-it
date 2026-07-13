"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m as motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu,
  ChevronRight,
  ChevronDown,
  Terminal,
  LogOut,
  LayoutDashboard,
  Target,
  LineChart,
  Layers,
  ClipboardList,
  Compass,
  ExternalLink,
  Users,
  Sun,
  Moon,
  Trophy,
  BookOpen,
} from "lucide-react";
import ClientOnly from "@/components/shared/ClientOnly";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/auth";
import { useFriendRequests } from "@/hooks/social";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const guestLinks = [{ href: "/docs", label: "Docs", icon: BookOpen }];

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/training", label: "Training", icon: Target },
  { href: "/roadmap", label: "Roadmap", icon: Compass },
  { href: "/upsolve", label: "Upsolve", icon: Layers },
  { href: "/statistics", label: "Statistics", icon: LineChart },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const secondaryLinks = [
  { href: "/training/reviews", label: "Reviews", icon: ClipboardList },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/levels", label: "Levels", icon: Trophy },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

const allUserLinks = [...primaryLinks, ...secondaryLinks];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const { incoming: incomingFriendRequests } = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const { theme, setTheme } = useTheme();
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close avatar menu on click outside
  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-avatar-menu]")) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [avatarMenuOpen]);

  // Close more menu on click outside
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setAvatarMenuOpen(false);
    setMoreMenuOpen(false);
  }, [pathname]);

  const isSecondaryActive = secondaryLinks.some((l) => pathname === l.href);
  const visibleLinks = user ? primaryLinks : guestLinks;
  const mobileLinks = user ? allUserLinks : guestLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b font-mono text-emerald-400 select-none bg-[#040604] relative",
        scrolled
          ? "border-emerald-500/20 bg-[#040604]/95 shadow-[0_2px_15px_rgba(4,6,4,0.85)]"
          : "border-emerald-500/10 bg-[#040604]/80"
      )}
    >
      {/* Top micro-line accent */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      {/* Bottom glowing accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent" />

      <div className="container mx-auto max-w-6xl px-4 flex items-center justify-between h-14 relative z-10">
        
        {/* Logo */}
        <div className="flex-none flex items-center">
          <Link href="/" className="overflow-visible">
            <div className="flex items-center gap-1.5 leading-none font-bold text-sm tracking-wider group">
              <span className="text-emerald-500/30 group-hover:text-emerald-400 transition-colors">&lt;</span>
              <span className="text-white group-hover:text-emerald-300 transition-colors uppercase">UPSOLVE</span>
              <span className="text-emerald-400 font-extrabold uppercase drop-shadow-[0_0_3px_rgba(16,185,129,0.3)]">.IT</span>
              <span className="text-emerald-500/30 group-hover:text-emerald-400 transition-colors">/&gt;</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {visibleLinks.length > 0 && (
          <nav className="hidden lg:flex items-center justify-center flex-1 h-full mx-6">
            <div className="flex items-center gap-1 h-full text-[10px]">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative flex items-center h-full px-2 transition-colors uppercase font-bold whitespace-nowrap group"
                  >
                    <span className="flex items-center gap-1.5 relative z-10">
                      <span className={cn(
                        "transition-colors font-bold",
                        isActive ? "text-emerald-400" : "text-emerald-500/20 group-hover:text-emerald-500/40"
                      )}>[</span>
                      <span className={cn(
                        "transition-colors tracking-widest",
                        isActive ? "text-emerald-300 drop-shadow-[0_0_3px_rgba(16,185,129,0.45)]" : "text-emerald-500/50 group-hover:text-emerald-300"
                      )}>
                        {link.label}
                      </span>
                      <span className={cn(
                        "transition-colors font-bold",
                        isActive ? "text-emerald-400" : "text-emerald-500/20 group-hover:text-emerald-500/40"
                      )}>]</span>
                    </span>

                    {link.href === "/friends" && friendRequestCount > 0 && (
                      <span className="absolute right-0 top-2.5 z-20 flex h-4 min-w-4 items-center justify-center rounded bg-red-500/80 px-1 text-[8px] font-black leading-none text-white">
                        {friendRequestCount > 9 ? "9+" : friendRequestCount}
                      </span>
                    )}

                    {/* Custom Glowing Slider Underline */}
                    <span className={cn(
                      "absolute bottom-0 inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent transition-all duration-300 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                      isActive && "scale-x-100 opacity-100"
                    )} />
                  </Link>
                );
              })}

              {/* More dropdown */}
              {user && (
                <div className="relative h-full flex items-center" ref={moreMenuRef}>
                  <button
                    onClick={() => setMoreMenuOpen((v) => !v)}
                    className="flex items-center h-full px-2 uppercase font-bold transition-colors text-[10px] group relative"
                  >
                    <span className="flex items-center gap-1 relative z-10">
                      <span className={cn(
                        "transition-colors font-bold",
                        isSecondaryActive || moreMenuOpen ? "text-emerald-400" : "text-emerald-500/20 group-hover:text-emerald-500/40"
                      )}>[</span>
                      <span className={cn(
                        "transition-colors tracking-widest mr-1",
                        isSecondaryActive || moreMenuOpen ? "text-emerald-300 drop-shadow-[0_0_3px_rgba(16,185,129,0.45)]" : "text-emerald-500/50 group-hover:text-emerald-300"
                      )}>
                        MORE
                      </span>
                      <ChevronDown
                        size={10}
                        className={cn(
                          "transition-transform duration-200 inline-block align-middle",
                          isSecondaryActive || moreMenuOpen ? "text-emerald-300" : "text-emerald-500/50 group-hover:text-emerald-300",
                          moreMenuOpen ? "rotate-180" : ""
                        )}
                      />
                      <span className={cn(
                        "transition-colors font-bold",
                        isSecondaryActive || moreMenuOpen ? "text-emerald-400" : "text-emerald-500/20 group-hover:text-emerald-500/40"
                      )}>]</span>
                    </span>

                    <span className={cn(
                      "absolute bottom-0 inset-x-3 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/45 to-transparent transition-all duration-300 scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                      (isSecondaryActive || moreMenuOpen) && "scale-x-100 opacity-100"
                    )} />
                  </button>

                  <AnimatePresence>
                    {moreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%-4px)] w-48 z-[9999] origin-top"
                      >
                        <div className="rounded-sm border border-emerald-500/25 bg-[#060a08] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.7)]">
                          {/* Mini Header */}
                          <div className="px-2.5 py-1 bg-emerald-950/30 border-b border-emerald-500/10 flex items-center justify-between text-[7px] text-emerald-500/40 font-bold uppercase tracking-widest">
                            <span>SYS_MORE_OPTIONS</span>
                          </div>

                          <div className="p-1 space-y-0.5">
                            {secondaryLinks.map((link) => {
                              const isActive = pathname === link.href;
                              return (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={() => setMoreMenuOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-2.5 py-1.5 rounded-sm text-[9px] font-bold uppercase transition-all border border-transparent group",
                                    isActive
                                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                      : "text-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/5 hover:border-emerald-500/10"
                                  )}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors">&gt;</span>
                                    <span>{link.label}</span>
                                  </span>
                                  {link.href === "/friends" && friendRequestCount > 0 && (
                                    <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded bg-red-500/80 px-1 text-[7px] font-bold text-white">
                                      {friendRequestCount > 9 ? "9+" : friendRequestCount}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex-none flex items-center gap-3">
          {/* Theme Toggle */}
          <ClientOnly>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 px-2.5 rounded-sm border border-emerald-500/20 bg-emerald-950/5 hover:bg-emerald-500/10 flex items-center justify-center text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/40 hover:shadow-[0_0_8px_rgba(16,185,129,0.15)] transition-all duration-200 text-[9px] font-bold uppercase"
              aria-label="Toggle theme"
            >
              <span className="flex items-center gap-1.5">
                {theme === "light" ? <Sun size={11} className="text-amber-500" /> : <Moon size={11} className="text-indigo-400" />}
                <span className="hidden sm:inline tracking-widest">{theme === "light" ? "LIGHT.SYS" : "DARK.SYS"}</span>
              </span>
            </button>
          </ClientOnly>

          {/* User profile / Actions */}
          <ClientOnly>
            {user ? (
              <div className="relative" data-avatar-menu>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAvatarMenuOpen((v) => !v)}
                    className={cn(
                      "outline-none flex items-center gap-2 h-8 px-2.5 rounded-sm border transition-all text-[9px] font-bold uppercase",
                      avatarMenuOpen
                        ? "border-emerald-500 text-emerald-300 bg-emerald-500/5 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                        : "border-emerald-500/20 text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/40 bg-emerald-950/5"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="size-6 border border-emerald-500/25 rounded-sm">
                        <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                        <AvatarFallback className="bg-emerald-950/30 text-[9px] font-bold text-emerald-400">
                          {user.codeforcesHandle?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 flex size-2">
                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                      </span>
                    </div>
                    <span className="hidden sm:block max-w-[80px] truncate tracking-widest">
                      {user.codeforcesHandle?.toUpperCase()}_
                    </span>
                    <ChevronDown size={10} className={cn("transition-transform duration-200", avatarMenuOpen ? "rotate-180" : "")} />
                  </button>
                </div>

                {/* Profile dropdown */}
                <AnimatePresence>
                  {avatarMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+6px)] w-64 z-[9999] origin-top-right"
                    >
                      <div className="rounded-sm border border-emerald-500/25 bg-[#060a08] overflow-hidden shadow-[0_6px_22px_rgba(0,0,0,0.7)]">
                        {/* Terminal status bar */}
                        <div className="px-2.5 py-1 bg-emerald-950/30 border-b border-emerald-500/15 flex items-center justify-between text-[8px] text-emerald-500/40 font-bold uppercase tracking-widest">
                          <span>USER_PROFILE // DETAILED_LOG</span>
                          <span>SYS.OK</span>
                        </div>

                        <div className="p-3 space-y-3">
                          {/* Summary Box */}
                          <div className="p-2.5 border border-emerald-500/10 bg-emerald-950/5 text-[9px] space-y-1.5 font-mono">
                            <div className="flex justify-between">
                              <span className="text-emerald-500/40">USER_HANDLE:</span>
                              <span className="font-bold text-emerald-300 truncate max-w-[120px]">{user.codeforcesHandle}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-500/40">CF_RATING:</span>
                              <span className="font-bold text-emerald-300">{user.rating || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-emerald-500/40">RANK:</span>
                              <span className="font-bold text-emerald-300 uppercase">{user.rank || "Recruit"}</span>
                            </div>
                          </div>

                          {/* Dropdown Options */}
                          <div className="space-y-1 text-[9px] font-bold">
                            <Link
                              href="/profile"
                              onClick={() => setAvatarMenuOpen(false)}
                              className="flex items-center justify-between p-2 rounded-sm hover:bg-emerald-500/5 text-emerald-500/70 hover:text-emerald-300 border border-transparent hover:border-emerald-500/10 transition-all group"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors">&gt;</span>
                                <span>VIEW_PROFILE.EXE</span>
                              </span>
                              <ChevronRight size={10} className="text-emerald-500/30 group-hover:text-emerald-300 transition-colors" />
                            </Link>

                            <button
                              onClick={() => {
                                window.open(`https://codeforces.com/profile/${user.codeforcesHandle}`, "_blank");
                                setAvatarMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-emerald-500/5 text-emerald-500/70 hover:text-emerald-300 border border-transparent hover:border-emerald-500/10 transition-all group"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors">&gt;</span>
                                <span>CODEFORCES_PAGE.CF</span>
                              </span>
                              <ExternalLink size={10} className="text-emerald-500/30 group-hover:text-emerald-300 transition-colors" />
                            </button>

                            {user?.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={() => setAvatarMenuOpen(false)}
                                className="flex items-center justify-between p-2 rounded-sm hover:bg-emerald-500/5 text-emerald-300 border border-transparent hover:border-emerald-500/10 transition-all group"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors">&gt;</span>
                                  <span>SYS_ADMIN_PANEL.SH</span>
                                </span>
                                <ChevronRight size={10} className="text-emerald-500/30 group-hover:text-emerald-300 transition-colors" />
                              </Link>
                            )}

                            <button
                              onClick={() => {
                                logout();
                                setAvatarMenuOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-red-950/20 text-emerald-500/40 hover:text-red-400 mt-2 border-t border-emerald-500/10 pt-3 transition-colors group"
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-emerald-500/20 group-hover:text-red-400 transition-colors">&gt;</span>
                                <span>SIGN_OUT.SYS</span>
                              </span>
                              <LogOut size={10} className="text-emerald-500/30 group-hover:text-red-400 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="text-[9px] font-bold uppercase tracking-wider h-8 rounded-sm border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-500/60 hover:text-emerald-300 font-mono"
                >
                  <Link href="/login">[ LOGIN.EXE ]</Link>
                </Button>
                <Button
                  asChild
                  className="text-[9px] font-bold uppercase tracking-wider h-8 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                >
                  <Link href="/signup">[ JOIN_FREE.SH ]</Link>
                </Button>
              </div>
            )}
          </ClientOnly>

          {/* Mobile menu sheet trigger */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="size-8 rounded-sm border border-emerald-500/20 bg-transparent flex items-center justify-center text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors">
                  <Menu size={14} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-64 p-0 border-l border-emerald-500/15 bg-[#040604] font-mono text-emerald-400"
              >
                <SheetHeader className="p-4 border-b border-emerald-500/10">
                  <SheetTitle className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Terminal size={12} />
                    <span>SYSTEM_NAVIGATION</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-54px)] justify-between">
                  <div className="p-3 space-y-1 text-[10px] font-bold uppercase">
                    {mobileLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-sm transition-all border border-transparent group",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25"
                              : "text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/20"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-emerald-500/20 group-hover:text-emerald-400 transition-colors">&gt;</span>
                            <span>{link.label}</span>
                          </span>
                          {link.href === "/friends" && friendRequestCount > 0 && (
                            <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded bg-red-500 px-1 text-[8px] font-bold text-white">
                              {friendRequestCount > 9 ? "9+" : friendRequestCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  <div className="p-4 border-t border-emerald-500/10 space-y-3 bg-emerald-950/[0.02]">
                    {user ? (
                      <div className="p-3 border border-emerald-500/15 bg-[#060a08] flex items-center justify-between rounded-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="size-7 border border-emerald-500/25 rounded-sm flex-shrink-0">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-[8px] font-bold bg-emerald-950/30 text-emerald-400">
                              {user.codeforcesHandle?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-[10px] font-bold text-emerald-300 truncate">
                              {user.codeforcesHandle}
                            </span>
                            <span className="text-[8px] text-emerald-500/35 uppercase truncate mt-0.5">
                              {user.rating && `${user.rating} · `}{user.rank || "Recruit"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={logout}
                          className="size-7 rounded-sm hover:bg-red-950/20 hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                        >
                          <LogOut size={13} />
                        </button>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          className="h-9 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 font-mono"
                        >
                          <Link href="/login" onClick={() => setIsMenuOpen(false)}>[ LOGIN.EXE ]</Link>
                        </Button>
                        <Button
                          asChild
                          className="h-9 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono"
                        >
                          <Link href="/signup" onClick={() => setIsMenuOpen(false)}>[ JOIN_FREE.SH ]</Link>
                        </Button>
                      </div>
                    )}
                    <div className="text-[8px] text-emerald-500/25 uppercase text-center tracking-wider font-mono">
                      &copy; 2026 UPSOLVE.IT
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

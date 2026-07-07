"use client";

import {useState, useEffect, useRef} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {m, AnimatePresence} from "framer-motion";
import {Button} from "@/components/ui/button";
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
  ShieldAlert,
  ClipboardList,
  Compass,
  ExternalLink,
  Users,
  User,
  Sun,
  Moon,
  Zap,
  Trophy,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";
import ClientOnly from "@/components/shared/ClientOnly";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useUser} from "@/hooks/auth";
import {useFriendRequests} from "@/hooks/social";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";
import {useTheme} from "next-themes";

const guestLinks = [{href: "/docs", label: "Docs", icon: BookOpen}];

/* ── Primary links (shown directly in the bar) ── */
const primaryLinks = [
  {href: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
  {href: "/training", label: "Training", icon: Target},
  {href: "/roadmap", label: "Roadmap", icon: Compass},
  {href: "/upsolve", label: "Upsolve", icon: Layers},
  {href: "/statistics", label: "Statistics", icon: LineChart},
  {href: "/leaderboard", label: "Leaderboard", icon: Trophy},
];

/* ── Secondary links (inside the "More" dropdown) ── */
const secondaryLinks = [
  {href: "/training/reviews", label: "Reviews", icon: ClipboardList},
  {href: "/friends", label: "Friends", icon: Users},
  {href: "/levels", label: "Levels", icon: Trophy},
  {href: "/docs", label: "Docs", icon: BookOpen},
];

const allUserLinks = [...primaryLinks, ...secondaryLinks];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const {user, logout} = useUser();
  const {incoming: incomingFriendRequests} = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const {theme, setTheme} = useTheme();
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
        "sticky top-0 z-50 w-full transition-all duration-500 bg-transparent px-3 sm:px-4 md:px-6 pointer-events-none",
        scrolled ? "py-2" : "py-4 md:py-5",
      )}
    >
      <div
        className={cn(
          "container mx-auto max-w-7xl rounded-full border backdrop-blur-2xl transition-all duration-500 pointer-events-auto",
          scrolled
            ? "bg-background/95 dark:bg-neutral-950/85 border-primary/20 dark:border-primary/30 shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] shadow-primary/5 dark:shadow-primary/5"
            : "bg-background/85 dark:bg-neutral-950/70 border-border/60 dark:border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        )}
      >
        {/* ─── Single Row ─── */}
        <div className="flex items-center justify-between h-14 px-5 md:px-6">
          {/* Logo */}
          <div className="flex-none flex items-center">
            <Link href="/" className="overflow-visible select-none">
              <m.div
                initial="initial"
                whileHover="hover"
                className="flex items-center gap-0.5 leading-none cursor-pointer"
              >
                <m.span
                  variants={{
                    initial: {x: 0},
                    hover: {x: -3, color: "#007F5F"},
                  }}
                  transition={{type: "spring", stiffness: 400, damping: 20}}
                  className="text-foreground/25 dark:text-foreground/20 font-light text-xl tracking-tight"
                >
                  {"<"}
                </m.span>
                <div className="flex items-baseline">
                  <span className="font-black text-base md:text-lg tracking-tight uppercase text-foreground">
                    UPSOLVE
                  </span>
                  <span className="font-black text-base md:text-lg tracking-tight bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent">
                    .it
                  </span>
                  <m.span
                    animate={{opacity: [1, 1, 0, 0]}}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      times: [0, 0.5, 0.5, 1],
                      ease: "linear",
                    }}
                    className="inline-block w-[3px] h-4 bg-primary/50 ml-0.5 translate-y-[1px] rounded-full"
                  />
                </div>
                <m.span
                  variants={{
                    initial: {x: 0},
                    hover: {x: 3, color: "#007F5F"},
                  }}
                  transition={{type: "spring", stiffness: 400, damping: 20}}
                  className="text-foreground/25 dark:text-foreground/20 font-light text-xl tracking-tight"
                >
                  {"/>"}
                </m.span>
              </m.div>
            </Link>
          </div>

          {/* ─── Desktop Navigation (Center) ─── */}
          {visibleLinks.length > 0 && (
            <nav 
              className="hidden lg:flex items-center justify-center flex-1 h-full mx-6"
              onMouseLeave={() => setHoveredTab(null)}
            >
              <div className="flex items-center gap-1 bg-muted/20 dark:bg-white/[0.02] rounded-full p-1 border border-border/30 dark:border-white/[0.04]">
                {visibleLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onMouseEnter={() => setHoveredTab(link.href)}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200 whitespace-nowrap z-10",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <m.div
                        animate={hoveredTab === link.href || isActive ? { scale: 1.1, y: -0.5 } : { scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        className={cn(
                          "transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        )}
                      >
                        <link.icon size={13} />
                      </m.div>
                      <span className="relative z-10">{link.label}</span>
                      
                      {link.href === "/friends" && friendRequestCount > 0 && (
                        <span className="absolute -right-1 -top-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black leading-none text-white shadow-sm ring-2 ring-background">
                          {friendRequestCount > 9
                            ? "9+"
                            : friendRequestCount}
                        </span>
                      )}

                      {/* Active Pill */}
                      {isActive && (
                        <m.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 bg-background dark:bg-white/[0.08] rounded-full shadow-[0_2px_8px_-2px_rgba(16,185,129,0.12)] border border-border/80 dark:border-white/[0.08]"
                          transition={{
                            type: "spring",
                            bounce: 0.12,
                            duration: 0.45,
                          }}
                        />
                      )}

                      {/* Hover Pill */}
                      {hoveredTab === link.href && !isActive && (
                        <m.div
                          layoutId="nav-hover-pill"
                          className="absolute inset-0 bg-muted/60 dark:bg-white/[0.04] rounded-full -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}

                {/* "More" dropdown trigger (only for logged-in users) */}
                {user && (
                  <div className="relative" ref={moreMenuRef}>
                    <button
                      onClick={() => setMoreMenuOpen((v) => !v)}
                      onMouseEnter={() => setHoveredTab("more")}
                      className={cn(
                        "relative flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-200 whitespace-nowrap z-10",
                        isSecondaryActive || moreMenuOpen
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <MoreHorizontal size={14} className="relative z-10" />
                      <span className="relative z-10">More</span>
                      <ChevronDown
                        size={10}
                        className={cn(
                          "relative z-10 transition-transform duration-200",
                          moreMenuOpen ? "rotate-180" : "",
                        )}
                      />

                      {(isSecondaryActive || moreMenuOpen) && (
                        <m.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 bg-background dark:bg-white/[0.08] rounded-full shadow-[0_2px_8px_-2px_rgba(16,185,129,0.12)] border border-border/80 dark:border-white/[0.08]"
                          transition={{
                            type: "spring",
                            bounce: 0.12,
                            duration: 0.45,
                          }}
                        />
                      )}

                      {hoveredTab === "more" && !(isSecondaryActive || moreMenuOpen) && (
                        <m.div
                          layoutId="nav-hover-pill"
                          className="absolute inset-0 bg-muted/60 dark:bg-white/[0.04] rounded-full -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                          }}
                        />
                      )}
                    </button>

                    {/* More dropdown panel */}
                    <AnimatePresence>
                      {moreMenuOpen && (
                        <m.div
                          initial={{opacity: 0, y: 10, scale: 0.95}}
                          animate={{opacity: 1, y: 0, scale: 1}}
                          exit={{opacity: 0, y: 10, scale: 0.95}}
                          transition={{
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                          className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-56 z-[9999] origin-top"
                        >
                          <div className="rounded-2xl bg-card/95 dark:bg-black/90 backdrop-blur-2xl border border-border/85 dark:border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] overflow-hidden p-1.5">
                            {secondaryLinks.map((link) => {
                              const isActive = pathname === link.href;
                              return (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  onClick={() => setMoreMenuOpen(false)}
                                  className={cn(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12px] font-semibold uppercase tracking-wider transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                      ? "text-primary bg-primary/8 dark:bg-primary/12"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/5",
                                  )}
                                >
                                  {isActive && (
                                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-primary" />
                                  )}
                                  <link.icon
                                    size={14}
                                    className={cn(
                                      "transition-colors group-hover:scale-110 duration-200",
                                      isActive
                                        ? "text-primary"
                                        : "text-muted-foreground/60 group-hover:text-foreground/80",
                                    )}
                                  />
                                  <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">{link.label}</span>
                                  {link.href === "/friends" &&
                                    friendRequestCount > 0 && (
                                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow-sm">
                                        {friendRequestCount > 9
                                          ? "9+"
                                          : friendRequestCount}
                                      </span>
                                    )}
                                </Link>
                              );
                            })}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* ─── Right Actions ─── */}
          <div className="flex-none flex items-center gap-2.5">
            {/* Theme Toggle */}
            <ClientOnly>
              <m.button
                whileHover={{ scale: 1.05, rotate: 8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="relative size-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 dark:hover:bg-white/[0.05] transition-all duration-200 border border-border/30 dark:border-white/[0.05]"
                aria-label="Toggle theme"
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-indigo-400" />
              </m.button>
            </ClientOnly>

            {/* Vertical separator */}
            <div className="hidden sm:block w-px h-5 bg-border/40 dark:bg-white/[0.08]" />

            {/* User / Auth */}
            <ClientOnly>
              {user ? (
                <div className="relative" data-avatar-menu>
                  {/* Status Pill Trigger */}
                  <div className="flex items-center gap-2 p-1 bg-muted/20 dark:bg-white/[0.02] border border-border/30 dark:border-white/[0.05] rounded-full pl-2.5 pr-1 py-1">
                    {user.rating && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/15 px-2 py-0.5 rounded-full">
                        <Zap size={9} className="fill-current" />
                        {user.rating}
                      </span>
                    )}
                    {user.rating && <div className="hidden sm:block w-px h-3.5 bg-border/40 dark:bg-white/[0.08]" />}
                    
                    <button
                      onClick={() => setAvatarMenuOpen((v) => !v)}
                      className={cn(
                        "outline-none group flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full transition-all duration-300",
                        avatarMenuOpen
                          ? "bg-primary/10 dark:bg-primary/15"
                          : "hover:bg-muted/40 dark:hover:bg-white/5",
                      )}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            "rounded-full p-[1.5px] transition-all duration-300",
                            avatarMenuOpen
                              ? "bg-gradient-to-br from-primary to-emerald-400"
                              : "bg-gradient-to-br from-border/80 to-border/80 group-hover:from-primary/50 group-hover:to-emerald-400/50",
                          )}
                        >
                          <Avatar className="size-7 border-[1.5px] border-background">
                            <AvatarImage
                              src={user.avatar}
                              alt={user.codeforcesHandle}
                            />
                            <AvatarFallback className="bg-primary/10 text-[10px] font-black uppercase text-primary">
                              {user.codeforcesHandle?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500 border-2 border-background"></span>
                        </span>
                      </div>
                      <span className="hidden xl:block text-[11px] font-bold text-foreground/80 group-hover:text-foreground truncate max-w-[90px] transition-colors">
                        {user.codeforcesHandle}
                      </span>
                      <ChevronDown
                        size={10}
                        className={cn(
                          "hidden xl:block text-muted-foreground/50 transition-transform duration-200",
                          avatarMenuOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {avatarMenuOpen && (
                      <m.div
                        initial={{opacity: 0, y: 10, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 10, scale: 0.95}}
                        transition={{
                          duration: 0.2,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="absolute right-0 top-[calc(100%+12px)] w-72 z-[9999] origin-top-right"
                      >
                        <div className="rounded-2xl bg-card/95 dark:bg-black/90 backdrop-blur-2xl border border-border/80 dark:border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.45)] overflow-hidden">
                          {/* Profile Card Header */}
                          <div className="relative p-5 pb-4">
                            {/* Gradient accent strip */}
                            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent dark:from-primary/25 dark:via-emerald-500/15 rounded-t-2xl" />

                            <div className="relative flex items-center gap-3.5">
                              <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-emerald-400 shadow-md shadow-primary/10">
                                <Avatar className="size-12 border-2 border-card">
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.codeforcesHandle}
                                  />
                                  <AvatarFallback className="bg-primary/10 text-sm font-black uppercase text-primary">
                                    {user.codeforcesHandle?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm font-extrabold tracking-tight text-foreground truncate">
                                  {user.codeforcesHandle}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 dark:bg-primary/15 px-2 py-0.5 rounded-full">
                                    <Zap size={9} className="fill-current" />
                                    {user.rank || "Recruit"}
                                  </span>
                                  {user.rating && (
                                    <span className="text-[10px] font-bold text-muted-foreground/75">
                                      CF: {user.rating}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Separator */}
                          <div className="h-px bg-border/60 dark:bg-white/[0.06] mx-4" />

                          {/* Quick Actions */}
                          <div className="p-2 space-y-0.5">
                            <Link
                              href="/profile"
                              onClick={() => setAvatarMenuOpen(false)}
                              className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200 group relative"
                            >
                              <div className="size-8 rounded-lg bg-primary/8 dark:bg-primary/12 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors duration-200">
                                <User size={15} />
                              </div>
                              <div className="flex-1">
                                <span className="text-[12px] font-bold block leading-none">
                                  My Profile
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                  View stats & progress
                                </span>
                              </div>
                              <ChevronRight
                                size={14}
                                className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200"
                              />
                            </Link>

                            <button
                              onClick={() => {
                                window.open(
                                  `https://codeforces.com/profile/${user.codeforcesHandle}`,
                                  "_blank",
                                );
                                setAvatarMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200 group relative"
                            >
                              <div className="size-8 rounded-lg bg-blue-500/8 dark:bg-blue-400/12 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-500/15 transition-colors duration-200">
                                <ExternalLink size={15} />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="text-[12px] font-bold block leading-none">
                                  Codeforces Profile
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                  Open in new tab
                                </span>
                              </div>
                              <ChevronRight
                                size={14}
                                className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200"
                              />
                            </button>

                            {user?.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={() => setAvatarMenuOpen(false)}
                                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200 group relative"
                              >
                                <div className="size-8 rounded-lg bg-amber-500/8 dark:bg-amber-400/12 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:bg-amber-500/15 transition-colors duration-200">
                                  <ShieldAlert size={15} />
                                </div>
                                <div className="flex-1">
                                  <span className="text-[12px] font-bold block leading-none">
                                    Admin Panel
                                  </span>
                                  <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                                    Manage platform
                                  </span>
                                </div>
                                <ChevronRight
                                  size={14}
                                  className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all duration-200"
                                />
                              </Link>
                            )}
                          </div>

                          {/* Separator */}
                          <div className="h-px bg-border/60 dark:bg-white/[0.06] mx-4" />

                          {/* Logout */}
                          <div className="p-2">
                            <button
                              onClick={() => {
                                logout();
                                setAvatarMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/8 transition-all duration-200 group"
                            >
                              <div className="size-8 rounded-lg bg-muted/40 dark:bg-muted/20 flex items-center justify-center group-hover:bg-red-500/10 transition-colors duration-200">
                                <LogOut
                                  size={14}
                                  className="group-hover:text-red-500 transition-colors duration-200"
                                />
                              </div>
                              <span className="text-[12px] font-bold">
                                Sign Out
                              </span>
                            </button>
                          </div>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Button
                    asChild
                    variant="ghost"
                    className="text-[11px] font-bold uppercase tracking-wider px-3.5 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200"
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    asChild
                    className="text-[11px] font-bold uppercase tracking-wider px-4.5 h-8 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:brightness-105 transition-all duration-200"
                  >
                    <Link href="/signup">Join Free</Link>
                  </Button>
                </div>
              )}
            </ClientOnly>

            {/* Mobile Menu Trigger */}
            <div className="lg:hidden flex items-center">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/[0.06] border border-border/30 dark:border-white/[0.05]"
                  >
                    <Menu className="size-4" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[340px] p-0 border-l border-border/50 dark:border-border/30 bg-background/98 dark:bg-background/95 backdrop-blur-2xl"
                >
                  <SheetHeader className="p-5 pb-4 border-b border-border/40 dark:border-border/20">
                    <SheetTitle>
                      <div className="flex items-center gap-3 text-left">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/10 border border-primary/15 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                          <Terminal size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black uppercase tracking-wider text-foreground">
                            Navigation
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground/60">
                            Quick access to all pages
                          </span>
                        </div>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col h-[calc(100%-73px)] justify-between overflow-y-auto">
                    <div className="p-4 space-y-1">
                      {mobileLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                              "flex items-center justify-between group p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                              isActive
                                ? "bg-primary/8 dark:bg-primary/12 text-primary"
                                : "text-foreground/75 hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground",
                            )}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={cn(
                                  "size-8 rounded-lg flex items-center justify-center transition-colors duration-200",
                                  isActive
                                    ? "bg-primary/12 dark:bg-primary/18 text-primary shadow-sm"
                                    : "bg-muted/40 dark:bg-muted/20 text-muted-foreground/70 group-hover:text-foreground/80",
                                )}
                              >
                                <link.icon size={15} />
                              </div>
                              <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider">
                                {link.label}
                                {link.href === "/friends" &&
                                  friendRequestCount > 0 && (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white shadow-sm">
                                      {friendRequestCount > 9
                                        ? "9+"
                                        : friendRequestCount}
                                    </span>
                                  )}
                              </span>
                            </div>
                            <ChevronRight
                              size={14}
                              className={cn(
                                "transition-all duration-200",
                                isActive
                                  ? "text-primary/70 translate-x-0"
                                  : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5",
                              )}
                            />
                            {isActive && (
                              <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-primary" />
                            )}
                          </Link>
                        );
                      })}
                    </div>

                    <div className="p-4 space-y-4 border-t border-border/40 dark:border-border/20 bg-muted/10 dark:bg-white/[0.01]">
                      {user ? (
                        <div className="p-3.5 rounded-2xl bg-card border border-border/60 dark:border-white/[0.06] flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-emerald-400">
                              <Avatar className="size-9 border-2 border-background">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="text-[10px] font-bold uppercase bg-primary/10 text-primary">
                                  {user.codeforcesHandle?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex flex-col min-w-0 leading-tight">
                              <span className="text-[12px] font-black tracking-tight truncate text-foreground">
                                {user.codeforcesHandle}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground/60 truncate mt-0.5 uppercase tracking-wider">
                                {user.rating && `${user.rating} · `}
                                {user.rank || "Recruit"}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={logout}
                            className="size-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 flex-shrink-0 transition-colors"
                          >
                            <LogOut size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-2">
                          <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-xl text-[12px] font-bold uppercase tracking-wider border-border/60 hover:bg-muted/40"
                          >
                            <Link
                              href="/login"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Log in
                            </Link>
                          </Button>
                          <Button
                            asChild
                            className="h-10 rounded-xl text-[12px] font-bold uppercase tracking-wider bg-primary text-primary-foreground"
                          >
                            <Link
                              href="/signup"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Join Free
                            </Link>
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/45">
                          &copy; 2026 Upsolve.it
                        </span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

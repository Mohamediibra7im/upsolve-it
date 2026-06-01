"use client";

import {useState, useEffect} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {motion, AnimatePresence} from "framer-motion";
import {Button} from "@/components/ui/button";
import {
  Menu,
  ChevronRight,
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
} from "lucide-react";
import ClientOnly from "@/components/shared/ClientOnly";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import useUser from "@/hooks/useUser";
import {useFriendRequests} from "@/hooks/useFriendRequests";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";
import {useTheme} from "next-themes";

const guestLinks: typeof userLinks = [];

const userLinks = [
  {href: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
  {href: "/training", label: "Training", icon: Target},
  {href: "/roadmap", label: "Roadmap", icon: Compass},
  {href: "/training/reviews", label: "Reviews", icon: ClipboardList},
  {href: "/statistics", label: "Statistics", icon: LineChart},
  {href: "/friends", label: "Friends", icon: Users},
  {href: "/upsolve", label: "Upsolve", icon: Layers},
  {href: "/levels", label: "Levels", icon: Trophy},
];

const adminLinks = [{href: "/admin", label: "Admin", icon: ShieldAlert}];

const NavBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const {user, logout} = useUser();
  const {incoming: incomingFriendRequests} = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const {theme, setTheme} = useTheme();

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

  // Close avatar menu on route change
  useEffect(() => {
    setAvatarMenuOpen(false);
  }, [pathname]);

  const baseLinks = user ? userLinks : guestLinks;
  const visibleLinks =
    user?.role === "admin" ? [...baseLinks, ...adminLinks] : baseLinks;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 bg-transparent px-3 sm:px-4 md:px-8 pointer-events-none",
        scrolled ? "py-2" : "py-3 md:py-4",
      )}
    >
      <div
        className={cn(
          "container mx-auto max-w-7xl h-14 rounded-2xl border backdrop-blur-xl transition-all duration-500 flex items-center justify-between px-3 md:px-5 pointer-events-auto",
          scrolled
            ? "bg-background/92 dark:bg-background/85 border-border/60 dark:border-border/50 shadow-lg shadow-black/[0.04] dark:shadow-black/20"
            : "bg-background/75 dark:bg-background/60 border-border/40 dark:border-border/30 shadow-md shadow-black/[0.03] dark:shadow-black/15",
        )}
      >
        {/* Logo */}
        <div className="flex-none flex items-center h-full">
          <Link href="/" className="overflow-visible select-none">
            <motion.div
              initial="initial"
              whileHover="hover"
              className="flex items-center gap-0.5 leading-none cursor-pointer"
            >
              <motion.span
                variants={{
                  initial: {x: 0},
                  hover: {x: -3, color: "hsl(var(--primary))"},
                }}
                transition={{type: "spring", stiffness: 400, damping: 20}}
                className="text-foreground/25 dark:text-foreground/20 font-light text-xl tracking-tight"
              >
                {"<"}
              </motion.span>
              <div className="flex items-baseline">
                <span className="font-black text-base md:text-lg tracking-tight uppercase text-foreground">
                  UPSOLVE
                </span>
                <span className="font-black text-base md:text-lg tracking-tight bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent">
                  .it
                </span>
                <motion.span
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
              <motion.span
                variants={{
                  initial: {x: 0},
                  hover: {x: 3, color: "hsl(var(--primary))"},
                }}
                transition={{type: "spring", stiffness: 400, damping: 20}}
                className="text-foreground/25 dark:text-foreground/20 font-light text-xl tracking-tight"
              >
                {"/>"}
              </motion.span>
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        {visibleLinks.length > 0 && (
          <nav className="hidden lg:flex items-center justify-center flex-1 h-full gap-0.5 px-4">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200 group",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <link.icon
                    size={13}
                    className={cn(
                      "transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/60 group-hover:text-foreground/70",
                    )}
                  />
                  <span className="relative z-10">{link.label}</span>
                  {link.href === "/friends" && friendRequestCount > 0 && (
                    <span className="absolute -right-1 -top-1 z-20 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-black leading-none text-white shadow-sm ring-2 ring-background">
                      {friendRequestCount > 9 ? "9+" : friendRequestCount}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-primary/8 dark:bg-primary/12 rounded-lg border border-primary/15 dark:border-primary/20"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.5,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex-none flex items-center gap-1.5 md:gap-2">
          {/* Theme Toggle */}
          <ClientOnly>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200"
              aria-label="Toggle theme"
            >
              <Sun className="h-[15px] w-[15px] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[15px] w-[15px] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </button>
          </ClientOnly>

          {/* User / Auth */}
          <ClientOnly>
            {user ? (
              <div className="relative" data-avatar-menu>
                {/* Avatar Trigger */}
                <button
                  onClick={() => setAvatarMenuOpen((v) => !v)}
                  className={cn(
                    "outline-none group flex items-center gap-2 pl-1.5 pr-2 md:pr-2.5 py-1 rounded-xl transition-all duration-300",
                    avatarMenuOpen
                      ? "bg-primary/8 dark:bg-primary/10 ring-1 ring-primary/30"
                      : "hover:bg-muted/50 dark:hover:bg-white/5",
                  )}
                >
                  <div className="relative">
                    <div
                      className={cn(
                        "rounded-full p-[2px] transition-all duration-300",
                        avatarMenuOpen
                          ? "bg-gradient-to-br from-primary to-emerald-400"
                          : "bg-gradient-to-br from-border to-border group-hover:from-primary/50 group-hover:to-emerald-400/50",
                      )}
                    >
                      <Avatar className="w-7 h-7 border-2 border-background">
                        <AvatarImage
                          src={user.avatar}
                          alt={user.codeforcesHandle}
                        />
                        <AvatarFallback className="bg-primary/10 text-[10px] font-black uppercase text-primary">
                          {user.codeforcesHandle?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-[11px] font-bold tracking-tight text-foreground">
                      {user.codeforcesHandle}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/60">
                      {user.rank || "Recruit"}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {avatarMenuOpen && (
                    <motion.div
                      initial={{opacity: 0, y: 6, scale: 0.97}}
                      animate={{opacity: 1, y: 0, scale: 1}}
                      exit={{opacity: 0, y: 6, scale: 0.97}}
                      transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                      className="absolute right-0 top-[calc(100%+8px)] w-72 z-[9999] origin-top-right"
                    >
                      <div className="rounded-2xl bg-card border border-border/60 dark:border-border/40 shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
                        {/* Profile Card Header */}
                        <div className="relative p-4 pb-3">
                          {/* Gradient accent strip */}
                          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-primary/15 via-emerald-500/10 to-transparent dark:from-primary/20 dark:via-emerald-500/15 rounded-t-2xl" />

                          <div className="relative flex items-start gap-3">
                            <div className="rounded-full p-[2px] bg-gradient-to-br from-primary to-emerald-400 shadow-lg shadow-primary/20">
                              <Avatar className="w-11 h-11 border-2 border-card">
                                <AvatarImage
                                  src={user.avatar}
                                  alt={user.codeforcesHandle}
                                />
                                <AvatarFallback className="bg-primary/10 text-sm font-black uppercase text-primary">
                                  {user.codeforcesHandle?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <p className="text-sm font-bold tracking-tight text-foreground truncate">
                                {user.codeforcesHandle}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 dark:bg-primary/15 px-1.5 py-0.5 rounded-md">
                                  <Zap size={9} />
                                  {user.rank || "Recruit"}
                                </span>
                                {user.rating && (
                                  <span className="text-[10px] font-medium text-muted-foreground/70">
                                    {user.rating}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>


                        </div>

                        {/* Separator */}
                        <div className="h-px bg-border/50 dark:bg-border/30 mx-3" />

                        {/* Quick Actions */}
                        <div className="p-2">
                          <Link
                            href="/profile"
                            onClick={() => setAvatarMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200 group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-primary/8 dark:bg-primary/12 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
                              <User size={14} />
                            </div>
                            <div className="flex-1">
                              <span className="text-[12px] font-semibold block">
                                My Profile
                              </span>
                              <span className="text-[10px] text-muted-foreground/50">
                                View stats & progress
                              </span>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all"
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
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/80 hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200 group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-blue-500/8 dark:bg-blue-400/12 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:bg-blue-500/15 transition-colors">
                              <ExternalLink size={14} />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="text-[12px] font-semibold block">
                                Codeforces Profile
                              </span>
                              <span className="text-[10px] text-muted-foreground/50">
                                Open in new tab
                              </span>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-muted-foreground/30 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 transition-all"
                            />
                          </button>
                        </div>

                        {/* Separator */}
                        <div className="h-px bg-border/50 dark:bg-border/30 mx-3" />

                        {/* Logout */}
                        <div className="p-2">
                          <button
                            onClick={() => {
                              logout();
                              setAvatarMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground/70 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/8 transition-all duration-200 group"
                          >
                            <div className="h-8 w-8 rounded-lg bg-muted/40 dark:bg-muted/20 flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                              <LogOut
                                size={14}
                                className="group-hover:text-red-500 transition-colors"
                              />
                            </div>
                            <span className="text-[12px] font-semibold">
                              Sign Out
                            </span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Button
                  asChild
                  variant="ghost"
                  className="text-[11px] font-semibold px-3.5 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="text-[11px] font-semibold px-4 h-8 rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 hover:brightness-110 transition-all duration-200"
                >
                  <Link href="/signup">Join Free</Link>
                </Button>
              </div>
            )}
          </ClientOnly>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 dark:hover:bg-white/5"
                >
                  <Menu className="h-4 w-4" />
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
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-emerald-500/10 border border-primary/15 flex items-center justify-center text-primary">
                        <Terminal size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold tracking-tight">
                          Navigation
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground/50">
                          Quick access to all pages
                        </span>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100%-73px)] justify-between overflow-y-auto">
                  <div className="p-3 space-y-0.5">
                    {visibleLinks.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            "flex items-center justify-between group p-3 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-primary/8 dark:bg-primary/12 text-primary"
                              : "text-foreground/70 hover:bg-muted/50 dark:hover:bg-white/5 hover:text-foreground",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                                isActive
                                  ? "bg-primary/12 dark:bg-primary/18 text-primary"
                                  : "bg-muted/40 dark:bg-muted/20 text-muted-foreground/60 group-hover:text-foreground/60",
                              )}
                            >
                              <link.icon size={15} />
                            </div>
                            <span className="flex items-center gap-2 text-[13px] font-semibold">
                              {link.label}
                              {link.href === "/friends" &&
                                friendRequestCount > 0 && (
                                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
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
                                ? "text-primary/50"
                                : "opacity-0 group-hover:opacity-60 group-hover:translate-x-0.5",
                            )}
                          />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="p-3 space-y-3 border-t border-border/40 dark:border-border/20">
                    {user ? (
                      <div className="p-3 rounded-xl bg-muted/30 dark:bg-muted/10 border border-border/40 dark:border-border/20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="rounded-full p-[2px] bg-gradient-to-br from-primary/50 to-emerald-400/50">
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-[10px] font-bold uppercase">
                                {user.codeforcesHandle?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex flex-col min-w-0 leading-tight">
                            <span className="text-[12px] font-bold tracking-tight truncate">
                              {user.codeforcesHandle}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground/50 truncate">
                              {user.rating && `${user.rating} · `}
                              {user.rank}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={logout}
                          className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500 flex-shrink-0 transition-colors"
                        >
                          <LogOut size={15} />
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-1.5">
                        <Button
                          asChild
                          variant="outline"
                          className="h-10 rounded-xl text-[12px] font-semibold border-border/50 hover:bg-muted/40"
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
                          className="h-10 rounded-xl text-[12px] font-semibold bg-primary text-primary-foreground"
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
                      <span className="text-[9px] font-medium text-muted-foreground/40">
                        © 2026 Upsolve.it
                      </span>
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

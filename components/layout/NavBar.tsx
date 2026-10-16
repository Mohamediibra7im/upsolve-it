"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Target,
  LineChart,
  Layers,
  ClipboardList,
  Compass,
  ExternalLink,
  Users,
  Trophy,
  BookOpen,
  UserRound,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientOnly from "@/components/shared/ClientOnly";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/auth";
import { useFriendRequests } from "@/hooks/social";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Brand from "./Brand";

const guestLinks = [
  { href: "/#features", label: "Features", icon: Layers },
  { href: "/#how-it-works", label: "How it works", icon: Compass },
  { href: "/#community", label: "Community", icon: Users },
  { href: "/docs", label: "Documentation", icon: BookOpen },
];
const primaryLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
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
  { href: "/docs", label: "Documentation", icon: BookOpen },
];
const menuItemClass =
  "cursor-pointer rounded-lg px-3 py-2.5 text-[13px] text-[#b6bdb9] focus:bg-white/[0.06] focus:text-[#f1f3ee]";
const menuPanelClass =
  "rounded-2xl border-[#2b3031] bg-[#191c1e] p-1.5 font-sans shadow-xl";

export default function NavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const { incoming: incomingFriendRequests } = useFriendRequests(!!user);
  const friendRequestCount = incomingFriendRequests.length;
  const visibleLinks = user ? primaryLinks : guestLinks;
  const mobileLinks = user ? [...primaryLinks, ...secondaryLinks] : guestLinks;
  const isSecondaryActive = secondaryLinks.some(
    (link) => pathname === link.href,
  );
  const badge =
    friendRequestCount > 0 ? (
      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#b5e3c4] px-1.5 text-[10px] font-semibold text-[#14241b]">
        {friendRequestCount > 9 ? "9+" : friendRequestCount}
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-[#101214]/95 font-sans backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between gap-2 px-4 sm:gap-6 sm:px-8 lg:px-10">
        <Link
          href="/"
          aria-label="Upsolve.it home"
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
        >
          <Brand />
        </Link>

        <nav
          aria-label="Main navigation"
          className={cn(
            "hidden items-center gap-1 lg:flex",
            !user && "ml-auto mr-5",
          )}
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]",
                pathname === link.href
                  ? "bg-white/[0.07] text-[#f1f3ee]"
                  : "text-[#929b98] hover:bg-white/[0.04] hover:text-[#f1f3ee]",
              )}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1.5 rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] data-[state=open]:bg-white/[0.07]",
                    isSecondaryActive
                      ? "bg-white/[0.07] text-[#f1f3ee]"
                      : "text-[#929b98] hover:text-[#f1f3ee]",
                  )}
                >
                  More <ChevronDown size={13} />
                  {friendRequestCount > 0 && (
                    <span
                      className="size-1.5 rounded-full bg-[#b5e3c4]"
                      aria-label={`${friendRequestCount} friend requests`}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={14}
                className={cn(menuPanelClass, "w-52")}
              >
                {secondaryLinks.map((link) => (
                  <DropdownMenuItem
                    key={link.href}
                    asChild
                    className={cn(
                      menuItemClass,
                      pathname === link.href &&
                        "bg-white/[0.05] text-[#b5e3c4]",
                    )}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                    >
                      <link.icon />
                      {link.label}
                      {link.href === "/friends" && badge}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <ClientOnly>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open account menu"
                    className="flex items-center gap-2 rounded-xl border border-[#2b3031] bg-[#191c1e] p-1.5 pr-2.5 text-[#b6bdb9] transition-colors hover:border-[#454d48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
                  >
                    <Avatar className="size-7 rounded-lg">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.codeforcesHandle}
                      />
                      <AvatarFallback className="rounded-lg bg-[#b5e3c4]/15 text-xs text-[#b5e3c4]">
                        {user.codeforcesHandle?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-24 truncate text-xs font-medium xl:block">
                      {user.codeforcesHandle}
                    </span>
                    <ChevronDown size={12} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={14}
                  className={cn(menuPanelClass, "w-64")}
                >
                  <DropdownMenuLabel className="px-3 pb-3 pt-2.5 font-normal">
                    <p className="truncate text-sm font-semibold text-[#f1f3ee]">
                      {user.codeforcesHandle}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[#929b98]">
                      {user.rank || "New competitor"}
                    </p>
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-[#101214] px-3 py-2 text-xs">
                      <span className="text-[#929b98]">Codeforces rating</span>
                      <span className="font-semibold text-[#b5e3c4]">
                        {user.rating || "Unrated"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-1 bg-[#2b3031]" />
                  <DropdownMenuItem asChild className={menuItemClass}>
                    <Link href="/profile">
                      <UserRound />
                      Your profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className={menuItemClass}>
                    <a
                      href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink />
                      Codeforces profile
                    </a>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild className={menuItemClass}>
                      <Link href="/admin">
                        <Settings />
                        Admin panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="mx-1 bg-[#2b3031]" />
                  <DropdownMenuItem
                    onSelect={() => logout()}
                    className={cn(
                      menuItemClass,
                      "focus:bg-red-400/10 focus:text-red-300",
                    )}
                  >
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  className="hidden rounded-[10px] px-4 text-[13px] text-[#b6bdb9] hover:bg-white/[0.05] hover:text-white sm:inline-flex"
                >
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  asChild
                  className="h-10 rounded-[10px] bg-[#b5e3c4] px-2.5 text-xs sm:px-4 sm:text-[13px] font-semibold text-[#14241b] hover:bg-[#c7edd3]"
                >
                  <Link href="/signup">Get started</Link>
                </Button>
              </div>
            )}
          </ClientOnly>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation"
                className="flex size-10 items-center justify-center rounded-[10px] border border-[#2b3031] text-[#b6bdb9] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] lg:hidden"
              >
                <Menu size={19} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[min(340px,90vw)] flex-col border-[#2b3031] bg-[#101214] p-0 font-sans text-[#f1f3ee]"
            >
              <SheetHeader className="border-b border-[#2b3031] px-6 py-6 text-left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate Upsolve.it and manage your account.
                </SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="flex-1 space-y-1 overflow-y-auto px-4 py-2"
              >
                {mobileLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                      pathname === link.href
                        ? "bg-[#b5e3c4]/10 text-[#b5e3c4]"
                        : "text-[#929b98] hover:bg-white/[0.05] hover:text-[#f1f3ee]",
                    )}
                  >
                    <link.icon size={17} />
                    {link.label}
                    {link.href === "/friends" && badge}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-[#2b3031] p-5">
                {user ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#191c1e] p-3">
                    <Avatar className="size-9 rounded-lg">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.codeforcesHandle}
                      />
                      <AvatarFallback className="bg-[#b5e3c4]/15 text-sm text-[#b5e3c4]">
                        {user.codeforcesHandle?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate text-sm font-medium">
                        {user.codeforcesHandle}
                      </p>
                      <p className="mt-0.5 text-xs text-[#929b98]">
                        View your profile
                      </p>
                    </Link>
                    <button
                      aria-label="Sign out"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex size-9 items-center justify-center rounded-lg text-[#929b98] hover:bg-white/[0.05] hover:text-red-300"
                    >
                      <LogOut size={17} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-xl border-[#2b3031] bg-transparent text-[#f1f3ee]"
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="rounded-xl bg-[#b5e3c4] font-semibold text-[#14241b] hover:bg-[#c7edd3]"
                    >
                      <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        Get started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

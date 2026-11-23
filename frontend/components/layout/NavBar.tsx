"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import ClientOnly from "@/components/shared/ClientOnly";
import UserAvatar from "@/components/shared/UserAvatar";
import { Rank } from "@/components/ui/kit";
import { useToast } from "@/components/providers/Toast";
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
import { SITE_URL } from "@/lib/seo";
import Brand from "./Brand";

export const guestLinks = [
  { href: "/modes", label: "Modes" },
  { href: "/ladder", label: "Ladder" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];
const memberLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/training", label: "Training" },
  { href: "/upsolve", label: "Upsolve" },
  { href: "/statistics", label: "Statistics" },
  { href: "/training/reviews", label: "Reviews" },
  { href: "/friends", label: "Friends" },
];
const adminLinks = [
  { href: "/admin/dashboard", label: "Admin overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/logs", label: "Logs" },
];

/** The longest matching link wins, so /training/reviews marks Reviews, not Training. */
function activeHref(pathname: string, links: { href: string }[]) {
  return links
    .filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

/** One bar for every surface: public pages, the app and the admin. Never a sidebar. */
export default function NavBar({
  admin = false,
  app = false,
}: {
  admin?: boolean;
  /** Inside the app. On public pages a signed-in visitor keeps the public
   *  links and gets their account menu plus a way back to the dashboard. */
  app?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, logout, syncProfile } = useUser();
  const { toast } = useToast();
  const { incoming } = useFriendRequests(!!user);
  const requests = incoming.length;

  const links = admin ? adminLinks : app && user ? memberLinks : guestLinks;
  const current = activeHref(pathname, links);
  const count = requests > 0 && (
    <span className="u-count" aria-label={`${requests} friend requests`}>
      {requests > 9 ? "9+" : requests}
    </span>
  );

  const sync = async () => {
    setIsSyncing(true);
    const res = await syncProfile();
    setIsSyncing(false);
    toast(
      res.success
        ? { title: "Profile synced with Codeforces.", variant: "success" }
        : {
            title: "Sync failed.",
            description: "Codeforces did not answer. Try again in a minute.",
            variant: "destructive",
          },
    );
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="u-nav">
        <Link href="/" aria-label="Upsolve It home" className="shrink-0">
          <Brand />
        </Link>

        <nav
          aria-label="Main navigation"
          className="u-nav__links hidden lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={current === link.href ? "page" : undefined}
            >
              {link.label}
              {link.href === "/friends" && count}
            </Link>
          ))}
        </nav>

        <div className="u-nav__end">
          <ClientOnly>
            {user ? (
              <>
                {app || admin ? (
                  <button
                    onClick={sync}
                    disabled={isSyncing}
                    className="u-btn u-btn--sm hidden sm:inline-flex"
                  >
                    <RefreshCw className={cn(isSyncing && "animate-spin")} />
                    {isSyncing ? "Syncing…" : "Sync profile"}
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="u-btn u-btn--sm hidden sm:inline-flex"
                  >
                    Dashboard <ArrowUpRight />
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="Open account menu"
                      className="flex items-center gap-2.5 rounded-md text-left"
                    >
                      <UserAvatar {...user} size={32} />
                      <span className="hidden text-[13px] leading-4 md:block">
                        <b className="block max-w-32 truncate">
                          {user.codeforcesHandle}
                        </b>
                        <Rank rating={user.rating} showRating />
                      </span>
                      <ChevronDown className="size-4 text-ink-muted" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-60"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <b className="block truncate">{user.codeforcesHandle}</b>
                      <Rank rating={user.rating} showRating className="t-sm" />
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <UserRound />
                        Your profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
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
                      <DropdownMenuItem asChild>
                        <Link href={admin ? "/dashboard" : "/admin/dashboard"}>
                          <ShieldCheck />
                          {admin ? "Back to the app" : "Admin"}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onSelect={sync}
                      disabled={isSyncing}
                      className="sm:hidden"
                    >
                      <RefreshCw />
                      Sync profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => logout()}
                      className="text-failed focus:text-failed"
                    >
                      <LogOut />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="u-btn u-btn--ghost hidden sm:inline-flex"
                >
                  Log in
                </Link>
                <Link href="/signup" className="u-btn u-btn--primary">
                  Get started <ArrowUpRight className="max-sm:hidden" />
                </Link>
              </>
            )}
          </ClientOnly>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open navigation"
                className="u-btn u-btn--icon lg:hidden"
              >
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex h-dvh w-full flex-col gap-0 border-line bg-ground p-0 sm:w-[380px]"
            >
              <SheetHeader className="h-16 shrink-0 justify-center space-y-0 border-b border-line px-5 text-left">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigate Upsolve It and manage your account.
                </SheetDescription>
                <Brand />
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4"
                  >
                    <UserAvatar {...user} size={40} />
                    <span className="min-w-0 flex-1 leading-5">
                      <b className="block truncate">{user.codeforcesHandle}</b>
                      <Rank rating={user.rating} showRating className="t-sm" />
                    </span>
                    <span className="t-eyebrow">Profile</span>
                  </Link>
                )}

                <p className="t-eyebrow px-5 pb-2 pt-6">
                  {admin ? "Admin" : app && user ? "Your training" : "Explore"}
                </p>
                <nav aria-label="Mobile navigation">
                  {links.map((link, i) => {
                    const active = current === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 border-b border-line px-5 py-3 first:border-t",
                          active ? "bg-surface text-ink" : "text-ink-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "t-num grid size-8 shrink-0 place-items-center rounded-sm text-xs font-semibold",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-sunk",
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="t-h2 min-w-0 flex-1 truncate">
                          {link.label}
                        </span>
                        {link.href === "/friends" && count}
                        <ArrowUpRight
                          className="size-4 shrink-0 text-ink-faint"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="grid shrink-0 gap-3 border-t border-line p-5">
                <div className="grid grid-cols-2 gap-2">
                  {!user ? (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="u-btn"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="u-btn u-btn--primary"
                      >
                        Get started
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="u-btn"
                      >
                        <Settings />
                        Settings
                      </Link>
                      {app || admin ? (
                        <button
                          onClick={sync}
                          disabled={isSyncing}
                          className="u-btn"
                        >
                          <RefreshCw
                            className={cn(isSyncing && "animate-spin")}
                          />
                          {isSyncing ? "Syncing…" : "Sync profile"}
                        </button>
                      ) : (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="u-btn u-btn--primary"
                        >
                          Dashboard <ArrowUpRight />
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <p className="t-eyebrow text-center">
                  {new URL(SITE_URL).hostname}
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

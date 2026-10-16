"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Users,
  Database,
  Layers,
  ArrowUpRight,
  Menu,
  ChevronLeft,
  Compass,
  Sparkles,
  Lightbulb,
  MailQuestion,
} from "lucide-react";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import Brand from "@/components/layout/Brand";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminNotificationBell } from "@/components/features/admin/AdminNotificationBell";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Members", icon: Users },
  { href: "/admin/levels", label: "Training levels", icon: Layers },
  { href: "/admin/roadmap", label: "Roadmap", icon: Compass },
  { href: "/admin/whats-new", label: "Product updates", icon: Sparkles },
  { href: "/admin/suggestions", label: "Resources", icon: Lightbulb },
  { href: "/admin/contact", label: "Support inbox", icon: MailQuestion },
  { href: "/admin/logs", label: "Activity log", icon: Database },
];

export default function AdminLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setCompact] = useState(false);
  const isAuthorized = user?.role === "admin";
  const currentPage =
    navItems.find((item) => pathname.startsWith(item.href))?.label ||
    "Administration";

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-compact");
    if (saved) setCompact(saved === "true");
  }, []);
  useEffect(() => {
    if (!isLoading && !isAuthorized) router.replace("/");
  }, [isLoading, isAuthorized, router]);

  const toggleCompact = () => {
    setCompact((current) => {
      localStorage.setItem("admin-sidebar-compact", String(!current));
      return !current;
    });
  };

  if (isLoading || !isAuthorized)
    return <Loader message="Checking your access…" />;

  const navigation = (compact = false) => (
    <nav
      aria-label="Administration"
      className={cn(
        "flex-1 space-y-1 overflow-y-auto py-5",
        compact ? "px-3" : "px-4",
      )}
    >
      {!compact && (
        <p className="mb-4 px-3 text-xs font-medium text-[#747e79]">
          Workspace
        </p>
      )}
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        const itemLink = (
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={compact ? item.label : undefined}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]",
              compact && "justify-center",
              active
                ? "bg-[#b5e3c4]/10 text-[#b5e3c4]"
                : "text-[#929b98] hover:bg-white/[0.04] hover:text-[#f1f3ee]",
            )}
          >
            <item.icon size={18} strokeWidth={1.7} className="shrink-0" />
            {!compact && <span>{item.label}</span>}
          </Link>
        );
        return compact ? (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{itemLink}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="rounded-lg border-[#2b3031] bg-[#191c1e] px-3 py-2 text-xs text-[#f1f3ee]"
            >
              {item.label}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div key={item.href}>{itemLink}</div>
        );
      })}
    </nav>
  );

  const account = (compact = false) => (
    <div className={cn("border-t border-[#2b3031]", compact ? "p-3" : "p-4")}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-[#191c1e]",
          compact ? "justify-center p-1.5" : "p-3",
        )}
      >
        <Avatar className="size-9 shrink-0 rounded-[10px]">
          <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
          <AvatarFallback className="rounded-[10px] bg-[#b5e3c4]/10 text-sm text-[#b5e3c4]">
            {user.codeforcesHandle?.[0]}
          </AvatarFallback>
        </Avatar>
        {!compact && (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[#f1f3ee]">
              {user.codeforcesHandle}
            </p>
            <p className="mt-1 text-xs text-[#747e79]">Administrator</p>
          </div>
        )}
      </div>
      <Link
        href="/"
        aria-label="Back to app"
        className={cn(
          "mt-3 flex min-h-10 items-center gap-2 rounded-xl text-xs text-[#929b98] transition-colors hover:bg-white/[0.04] hover:text-[#f1f3ee]",
          compact ? "justify-center" : "px-3",
        )}
      >
        <ArrowUpRight size={16} />
        {!compact && "Back to app"}
      </Link>
    </div>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-dvh overflow-hidden bg-[#101214] font-sans text-[#f1f3ee]">
        <aside
          aria-label="Admin sidebar"
          className={cn(
            "relative hidden shrink-0 flex-col border-r border-[#2b3031] bg-[#121516] transition-[width] duration-200 lg:flex",
            isCompact ? "w-[84px]" : "w-[248px]",
          )}
        >
          <div
            className={cn(
              "flex h-[84px] shrink-0 items-center border-b border-[#2b3031]",
              isCompact ? "justify-center" : "px-6",
            )}
          >
            {isCompact ? (
              <Link
                href="/admin/dashboard"
                aria-label="Admin overview"
                className="flex size-9 items-center justify-center rounded-xl bg-[#b5e3c4] text-[#14241b]"
              >
                <Shield size={18} />
              </Link>
            ) : (
              <Link href="/admin/dashboard" aria-label="Admin overview">
                <Brand />
              </Link>
            )}
            <button
              onClick={toggleCompact}
              aria-label={isCompact ? "Expand sidebar" : "Collapse sidebar"}
              className="absolute -right-3 z-10 flex size-6 items-center justify-center rounded-full border border-[#343b37] bg-[#191c1e] text-[#929b98] hover:text-[#f1f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
            >
              <ChevronLeft
                size={13}
                className={cn(isCompact && "rotate-180")}
              />
            </button>
          </div>
          {navigation(isCompact)}
          {account(isCompact)}
        </aside>
        <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="flex w-[min(300px,90vw)] flex-col gap-0 border-[#2b3031] bg-[#121516] p-0 font-sans text-[#f1f3ee]"
          >
            <SheetHeader className="border-b border-[#2b3031] p-6 text-left">
              <SheetTitle>
                <Brand />
              </SheetTitle>
              <SheetDescription className="sr-only">
                Administration navigation and account
              </SheetDescription>
            </SheetHeader>
            {navigation()}
            {account()}
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[84px] shrink-0 items-center justify-between gap-4 border-b border-[#2b3031] px-5 sm:px-8 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin navigation"
                className="shrink-0 rounded-xl border border-[#2b3031] text-[#929b98] lg:hidden"
              >
                <Menu size={19} />
              </Button>
              <div className="min-w-0">
                <p className="text-xs text-[#747e79]">Administration</p>
                <p className="mt-1 truncate text-[15px] font-medium text-[#f1f3ee]">
                  {currentPage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden items-center gap-1.5 rounded-full border border-[#2b3031] px-3 py-1.5 text-xs text-[#929b98] sm:inline-flex">
                <Shield size={12} />
                Admin workspace
              </span>
              <AdminNotificationBell />
            </div>
          </header>
          <main
            id="main-content"
            className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8 sm:py-9 lg:px-10"
          >
            <div className="mx-auto max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

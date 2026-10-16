"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { HelpCircle, Bell, Lightbulb } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const supportLinks = [
  { href: "/help", label: "Help center", icon: HelpCircle },
  { href: "/whats-new", label: "What's new", icon: Bell },
  { href: "/suggestions", label: "Share a suggestion", icon: Lightbulb },
];

export default function SystemConsoleFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-50 font-sans sm:bottom-6 sm:right-7",
        pathname === "/training" && "hidden lg:block",
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Open help and resources"
            className="flex size-11 items-center justify-center rounded-full border border-[#343a37] bg-[#202523] text-[#b6bdb9] shadow-lg transition-colors hover:border-[#6f8174] hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] data-[state=open]:text-[#b5e3c4]"
          >
            <HelpCircle size={19} strokeWidth={1.7} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={12}
          className="w-56 rounded-2xl border-[#2b3031] bg-[#191c1e] p-1.5 font-sans shadow-xl"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs font-medium text-[#747e79]">
            Here to help
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-1 bg-[#2b3031]" />
          {supportLinks
            .filter((link) => link.href !== pathname)
            .map((link) => (
              <DropdownMenuItem
                key={link.href}
                asChild
                className="cursor-pointer rounded-lg px-3 py-2.5 text-[13px] text-[#b6bdb9] focus:bg-white/[0.06] focus:text-[#f1f3ee]"
              >
                <Link href={link.href}>
                  <link.icon />
                  {link.label}
                </Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

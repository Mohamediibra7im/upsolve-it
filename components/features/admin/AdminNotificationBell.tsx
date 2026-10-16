"use client";

import Link from "next/link";
import { Bell, MailQuestion, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useUnreadContact } from "@/hooks/admin";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/**
 * Admin header notification bell — backed by real unread support messages
 * (/api/admin/contact/unread). Shows the live unread count and a dropdown of
 * the latest messages, each linking to the contact inbox.
 */
export function AdminNotificationBell() {
  const { count, items, isLoading, isError } = useUnreadContact();
  const hasUnread = count > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${hasUnread ? ` (${count} unread)` : ""}`}
          className="relative flex size-9 items-center justify-center rounded-xl border border-[#2b3031] bg-transparent text-[#929b98] hover:text-[#f1f3ee] hover:bg-[#b5e3c4]/[0.06] transition-colors"
        >
          <Bell size={14} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-xl bg-[#b5e3c4] text-xs font-medium text-black tabular-nums">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border-[#2b3031] bg-[#191c1e] p-0 font-sans text-[#b5e3c4] z-[150]"
      >
        <div className="flex items-center justify-between border-b border-[#2b3031] px-3 py-2.5">
          <span className="text-xs font-medium text-[#f1f3ee]">
            Support messages
          </span>
          <span className="text-xs font-medium text-[#929b98] tabular-nums">
            {count} unread
          </span>
        </div>

        {isLoading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-[#929b98]"
          >
            <Loader2 size={16} className="motion-safe:animate-spin" />
            Loading messages…
          </div>
        ) : isError ? (
          <p
            role="alert"
            className="px-4 py-8 text-center text-sm leading-6 text-[#929b98]"
          >
            Messages are temporarily unavailable. Open the inbox to try again.
          </p>
        ) : items.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs font-medium text-[#929b98]">
            You are all caught up
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {items.map((msg) => (
              <li key={msg._id}>
                <DropdownMenuItem asChild className="rounded-none p-0">
                  <Link
                    href="/admin/contact"
                    className="flex items-start gap-2.5 border-b border-[#2b3031] px-3 py-2.5 hover:bg-[#b5e3c4]/[0.06] transition-colors"
                  >
                    <MailQuestion
                      size={12}
                      className="mt-0.5 shrink-0 text-[#929b98]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-[#f1f3ee]">
                          {msg.name}
                        </span>
                        <span className="shrink-0 text-xs font-medium text-[#929b98] tabular-nums">
                          {timeAgo(msg.createdAt)}
                        </span>
                      </div>
                      <div className="truncate text-xs font-medium text-[#929b98]">
                        {msg.subject}
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}

        <DropdownMenuItem asChild className="rounded-none p-0">
          <Link
            href="/admin/contact"
            className="block border-t border-[#2b3031] px-3 py-2.5 text-center text-xs font-medium text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] transition-colors"
          >
            Open support inbox
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

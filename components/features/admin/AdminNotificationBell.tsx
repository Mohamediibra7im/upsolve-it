"use client";

import Link from "next/link";
import { Bell, MailQuestion } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
  const { count, items } = useUnreadContact();
  const hasUnread = count > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${hasUnread ? ` (${count} unread)` : ""}`}
          className="relative flex size-9 items-center justify-center rounded-sm border border-emerald-500/15 bg-transparent text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-500/5 transition-colors"
        >
          <Bell size={14} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center rounded-sm bg-emerald-500 text-[8px] font-bold text-black tabular-nums">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-sm border-emerald-500/20 bg-[#060a08] p-0 font-mono text-emerald-400 z-[150]"
      >
        <div className="flex items-center justify-between border-b border-emerald-500/15 px-3 py-2.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">
            Unread Support
          </span>
          <span className="text-[9px] font-bold text-emerald-500/40 tabular-nums">
            {count} PENDING
          </span>
        </div>

        {items.length === 0 ? (
          <div className="px-3 py-6 text-center text-[9px] font-bold uppercase tracking-widest text-emerald-500/30">
            [ INBOX_CLEAR ]
          </div>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {items.map((msg) => (
              <li key={msg._id}>
                <Link
                  href="/admin/contact"
                  className="flex items-start gap-2.5 border-b border-emerald-500/5 px-3 py-2.5 hover:bg-emerald-500/5 transition-colors"
                >
                  <MailQuestion
                    size={12}
                    className="mt-0.5 shrink-0 text-emerald-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[10px] font-bold text-emerald-300">
                        {msg.name}
                      </span>
                      <span className="shrink-0 text-[8px] font-bold text-emerald-500/35 tabular-nums">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <div className="truncate text-[9px] font-bold text-emerald-500/50">
                      {msg.subject}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/admin/contact"
          className="block border-t border-emerald-500/15 px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/5 transition-colors"
        >
          [ OPEN_INBOX.SH ]
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

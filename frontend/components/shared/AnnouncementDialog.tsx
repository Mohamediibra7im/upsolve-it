"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/auth";
import { apiFetcher } from "@/lib/apiClient";
import type { CurrentAnnouncement } from "@/types/Announcement";
import { isActionUrl } from "@/utils/announcement";

// Never interrupt signing in, the admin area, or training: a session may be
// running there, and its state lives inside the training page.
const QUIET_ROOTS = [
  "/login",
  "/signup",
  "/reset-password",
  "/admin",
  "/training",
];
const isQuiet = (pathname: string) =>
  QUIET_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );

const OPEN_DELAY_MS = 600;
const DISMISSED_KEY = "upsolve-announcements-dismissed";

/** One announcement at one edit: an edited announcement is shown again. */
const markerOf = (a: CurrentAnnouncement) => `${a.id}:${a.updatedAt}`;

function readDismissed(): string[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(DISMISSED_KEY) ?? "[]",
    );
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function rememberDismissed(marker: string) {
  try {
    localStorage.setItem(
      DISMISSED_KEY,
      JSON.stringify(
        [...readDismissed().filter((m) => m !== marker), marker].slice(-20),
      ),
    );
  } catch {
    // Storage is blocked: the announcement comes back on the next load.
  }
}

/** The inside of the pop-up. The admin editor draws the same thing as its preview. */
export function AnnouncementBody({
  announcement,
  onClose,
  preview = false,
}: {
  announcement: Omit<CurrentAnnouncement, "id" | "updatedAt">;
  onClose?: () => void;
  /** Outside a dialog: plain elements in place of the dialog's title and description. */
  preview?: boolean;
}) {
  const { title, message, actionLabel, actionUrl } = announcement;
  const Title = preview ? "h3" : DialogTitle;
  const Message = preview ? "p" : DialogDescription;
  const action =
    actionLabel && actionUrl && isActionUrl(actionUrl)
      ? { label: actionLabel, href: actionUrl }
      : null;

  return (
    <div className="grid gap-4 text-left">
      <div className="grid gap-2 pr-8">
        <p className="t-eyebrow">Announcement</p>
        <Title className="t-h2 break-words">{title}</Title>
      </div>
      <Message className="t-muted whitespace-pre-line break-words text-[15px] leading-6">
        {message}
      </Message>
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {!action ? (
          <Button onClick={onClose}>Got it</Button>
        ) : action.href.startsWith("/") ? (
          <Link
            href={action.href}
            onClick={onClose}
            className="u-btn u-btn--primary"
          >
            {action.label}
          </Link>
        ) : (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="u-btn u-btn--primary"
          >
            {action.label}
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

/** Shows the current announcement once per browser, shortly after the site loads. */
export default function AnnouncementDialog() {
  const pathname = usePathname() ?? "";
  const { user, isLoading } = useUser();
  // A signed-in browser says so: the server then answers an expired session
  // with a 401, which apiFetcher turns into a refresh and a second try.
  const { data } = useSWR<{ announcement: CurrentAnnouncement | null }>(
    isLoading ? null : `/api/announcements/current${user ? "?member=1" : ""}`,
    apiFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const [open, setOpen] = useState(false);

  const announcement = data?.announcement ?? null;
  const marker = announcement && markerOf(announcement);
  // An unverified member is held at the handle-verification gate.
  const allowed = !!marker && !isQuiet(pathname) && (!user || user.isVerified);

  useEffect(() => {
    if (!allowed || readDismissed().includes(marker)) return;
    const timer = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [allowed, marker]);

  if (!announcement || !marker || !allowed) return null;

  const close = () => {
    setOpen(false);
    rememberDismissed(marker);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <AnnouncementBody announcement={announcement} onClose={close} />
      </DialogContent>
    </Dialog>
  );
}

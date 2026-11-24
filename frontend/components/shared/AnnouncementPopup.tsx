"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser } from "@/hooks/auth";
import { apiFetcher } from "@/lib/apiClient";
import type { CurrentAnnouncement } from "@/types/Announcement";
import { AnnouncementBody } from "./AnnouncementDialog";

// Never over signing in, the admin area, or training: a session may be
// running there, and nothing should pull the eye from it.
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

const DISMISSED_KEY = "upsolve-announcements-dismissed";
// The server sends at most 50, so 50 markers remember them all.
const DISMISSED_MAX = 50;

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

/**
 * What is new, in a pop-up when the site opens: every current announcement the
 * visitor has not closed yet, newest first, one at a time. Closing it puts
 * them all away: only a new or an edited one opens it again.
 */
export default function AnnouncementPopup() {
  const pathname = usePathname() ?? "";
  const { user, isLoading } = useUser();
  // A signed-in browser says so: the server then answers an expired session
  // with a 401, which apiFetcher turns into a refresh and a second try.
  const { data } = useSWR<{ announcements: CurrentAnnouncement[] }>(
    isLoading ? null : `/api/announcements/current${user ? "?member=1" : ""}`,
    apiFetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  // Nothing is drawn until the announcements arrive, which is after the
  // browser takes over, so reading storage here cannot disagree with the server.
  const [dismissed, setDismissed] = useState(readDismissed);
  const [index, setIndex] = useState(0);
  // Closed once, it stays closed until the site is opened again.
  const [closed, setClosed] = useState(false);

  const visible = (data?.announcements ?? []).filter(
    (a) => !dismissed.includes(markerOf(a)),
  );
  const count = visible.length;
  // An unverified member is held at the handle-verification gate.
  const allowed = count > 0 && !isQuiet(pathname) && (!user || user.isVerified);
  if (!allowed || closed) return null;

  const at = Math.min(index, count - 1);
  const shown = visible[at];
  const close = () => {
    const next = [...new Set([...dismissed, ...visible.map(markerOf)])].slice(
      -DISMISSED_MAX,
    );
    setClosed(true);
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Storage is blocked: the pop-up comes back on the next visit.
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <AnnouncementBody
          key={markerOf(shown)}
          announcement={shown}
          onClose={close}
          position={count > 1 ? `${at + 1} of ${count}` : undefined}
          stepper={
            count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous announcement"
                  className="u-btn u-btn--icon"
                  disabled={at === 0}
                  onClick={() => setIndex(at - 1)}
                >
                  <ArrowLeft />
                </button>
                <button
                  type="button"
                  aria-label="Next announcement"
                  className="u-btn u-btn--icon"
                  disabled={at === count - 1}
                  onClick={() => setIndex(at + 1)}
                >
                  <ArrowRight />
                </button>
              </>
            )
          }
        />
      </DialogContent>
    </Dialog>
  );
}

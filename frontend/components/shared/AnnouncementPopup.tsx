"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUser } from "@/hooks/auth";
import { apiFetcher } from "@/lib/apiClient";
import type { CurrentAnnouncement } from "@/types/Announcement";
import { AnnouncementAction, AnnouncementBody } from "./AnnouncementDialog";

// Never beside signing in, the admin area, or training: a session may be
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

const ROTATE_MS = 6000;
const DISMISSED_KEY = "upsolve-announcements-dismissed";
// The server sends at most 50, so 50 markers remember a full bar.
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
 * Every current announcement, one at a time, in a bar under the menu. Each
 * slides up after a few seconds; its title opens the whole announcement.
 * Hiding the bar hides what is in it now: a new or edited one brings it back.
 */
export default function AnnouncementBar() {
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
  const [step, setStep] = useState({ index: 0, back: false });
  const [paused, setPaused] = useState(false);
  const [reading, setReading] = useState<CurrentAnnouncement | null>(null);

  const visible = (data?.announcements ?? []).filter(
    (a) => !dismissed.includes(markerOf(a)),
  );
  const count = visible.length;
  // An unverified member is held at the handle-verification gate.
  const allowed = count > 0 && !isQuiet(pathname) && (!user || user.isVerified);
  const index = count ? step.index % count : 0;
  const rotating = allowed && count > 1 && !paused && !reading;

  // A timeout per announcement, so stepping by hand gives the next one its
  // full time too.
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(
      () => setStep({ index: index + 1, back: false }),
      ROTATE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [rotating, index]);

  if (!allowed) return null;
  const shown = visible[index];

  const hide = () => {
    const next = [...new Set([...dismissed, ...visible.map(markerOf)])].slice(
      -DISMISSED_MAX,
    );
    setDismissed(next);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Storage is blocked: the bar comes back on the next load.
    }
  };

  return (
    <>
      <section
        aria-label="Announcements"
        className="u-annbar"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {count > 1 && (
          <span className="u-annbar__count t-num" aria-hidden="true">
            {index + 1} / {count}
          </span>
        )}
        <div className="u-annbar__view">
          <div
            key={markerOf(shown)}
            className="u-annbar__item"
            data-back={step.back || undefined}
          >
            <button
              type="button"
              className="u-annbar__title"
              onClick={() => setReading(shown)}
            >
              {count > 1 && (
                <span className="sr-only">
                  Announcement {index + 1} of {count}:{" "}
                </span>
              )}
              {shown.title}
            </button>
            <AnnouncementAction
              announcement={shown}
              className="u-btn u-btn--sm max-md:hidden"
            />
          </div>
        </div>
        {count > 1 && (
          <div className="u-annbar__step">
            <button
              type="button"
              aria-label="Previous announcement"
              className="u-btn u-btn--sm u-btn--icon"
              onClick={() =>
                setStep({ index: (index - 1 + count) % count, back: true })
              }
            >
              <ArrowUp />
            </button>
            <button
              type="button"
              aria-label="Next announcement"
              className="u-btn u-btn--sm u-btn--icon"
              onClick={() => setStep({ index: index + 1, back: false })}
            >
              <ArrowDown />
            </button>
          </div>
        )}
        <button
          type="button"
          aria-label="Hide announcements"
          className="u-btn u-btn--sm u-btn--icon u-btn--ghost"
          onClick={hide}
        >
          <X />
        </button>
      </section>

      <Dialog
        open={!!reading}
        onOpenChange={(open) => !open && setReading(null)}
      >
        <DialogContent className="sm:max-w-md">
          {reading && (
            <AnnouncementBody
              announcement={reading}
              onClose={() => setReading(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

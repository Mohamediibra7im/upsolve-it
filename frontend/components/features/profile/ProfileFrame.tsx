"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import VerifyCodeforcesDialog from "@/components/shared/VerifyCodeforcesDialog";
import ProfileHeader from "./ProfileHeader";
import { useProfileData } from "./useProfileData";

const PAGES = [
  { href: "/profile", label: "Overview" },
  { href: "/profile/achievements", label: "Achievements" },
  { href: "/profile/activity", label: "Activity" },
];

/** Shared by the three profile pages: who you are, then links between them.
 *  Account settings are a page of their own at /settings. */
export default function ProfileFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, historyError, refreshHistory } = useProfileData();
  const [verifying, setVerifying] = useState(false);
  if (!user) return null;

  return (
    <>
      <div className="mb-8">
        <ProfileHeader user={user} onVerify={() => setVerifying(true)} />
      </div>

      {historyError && (
        <div
          role="alert"
          className="u-panel mb-6 flex flex-wrap items-center justify-between gap-3 px-5 py-4"
        >
          <p>Your sessions did not load, so some numbers here are missing.</p>
          <Button variant="outline" size="sm" onClick={() => refreshHistory()}>
            Try again
          </Button>
        </div>
      )}

      <nav aria-label="Profile pages" className="u-tabs mb-6">
        {PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            aria-current={pathname === page.href ? "page" : undefined}
          >
            {page.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6">{children}</div>

      <VerifyCodeforcesDialog
        isOpen={verifying}
        onClose={() => setVerifying(false)}
      />
    </>
  );
}

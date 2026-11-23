"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import ClosingCall from "@/components/features/landing/ClosingCall";
import { useUser } from "@/hooks/auth";

/** "Edit profile", shown only to the person whose public page this is. */
export function OwnerEditLink({ handle }: { handle: string }) {
  const { user } = useUser();
  if (user?.codeforcesHandle.toLowerCase() !== handle.toLowerCase())
    return null;
  return (
    <Link href="/settings" className="u-btn u-btn--sm u-btn--ghost">
      <Pencil aria-hidden="true" />
      Edit profile
    </Link>
  );
}

/** The sign-up band, for visitors who are not signed in. */
export function GuestCall() {
  const { user, isLoading } = useUser();
  if (isLoading || user) return null;
  return <ClosingCall title="Practice with a plan." />;
}

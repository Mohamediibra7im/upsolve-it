"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Copy } from "lucide-react";
import { useUser } from "@/hooks/auth";
import { apiClient, swrFetcher } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";

type Setting = { publicProfile: boolean };

const ENDPOINT = "/api/public-profile";

/** The Account-tab line that turns your public page (/u/your-handle) on or off. */
export default function PublicProfileSetting() {
  const { user } = useUser();
  const { data, mutate } = useSWR<Setting>(ENDPOINT, swrFetcher, {
    revalidateOnFocus: false,
  });
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const on = data?.publicProfile === true;
  const path = user ? `/u/${user.codeforcesHandle}` : null;

  const toggle = async () => {
    const next = { publicProfile: !on };
    setBusy(true);
    try {
      await mutate(apiClient.put<Setting>(ENDPOINT, next), {
        optimisticData: next,
        rollbackOnError: true,
        revalidate: false,
      });
    } catch {
      toast({
        title: "Your public profile setting was not saved.",
        description: `It is still ${on ? "on" : "off"}. Try again in a moment.`,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (link: string) => {
    try {
      await navigator.clipboard.writeText(
        new URL(link, window.location.origin).toString(),
      );
      toast({ title: "Link copied", variant: "success" });
    } catch {
      toast({
        title: "The link was not copied.",
        description: "Open the link and copy the address from your browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="u-kv flex-wrap items-center">
      <div className="min-w-0 max-w-xl">
        <h3 id="public-profile-title" className="t-h3">
          Public profile
        </h3>
        <p id="public-profile-text" className="t-sm t-muted">
          Anyone with the link can see your name, bio, links and avatar, and
          your rating, streaks and practice activity. Your email and problem
          history stay private.
        </p>
        {on && path && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link href={path} className="t-link t-sm t-num break-all">
              {path}
            </Link>
            <button
              type="button"
              className="u-btn u-btn--sm"
              onClick={() => copy(path)}
            >
              <Copy aria-hidden="true" />
              Copy link
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby="public-profile-title"
        aria-describedby="public-profile-text"
        disabled={!data || busy}
        onClick={toggle}
        className="group flex shrink-0 items-center gap-3 rounded-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="t-sm t-num text-ink-muted">{on ? "On" : "Off"}</span>
        <span className="flex h-6 w-11 items-center rounded-sm border border-line-strong bg-surface-sunk px-0.5 transition-colors group-aria-checked:border-accent-ink group-aria-checked:bg-accent-soft">
          <span className="size-4 rounded-sm bg-ink-muted transition-transform group-aria-checked:translate-x-[22px] group-aria-checked:bg-accent-ink" />
        </span>
      </button>
    </div>
  );
}

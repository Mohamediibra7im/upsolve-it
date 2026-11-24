"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";
import { useUser } from "@/hooks/auth";

export type ReminderStatus = {
  on: boolean;
  /** Where it is sent while it is on. */
  email: string | null;
  /** False until the account has a confirmed email to send to. */
  canTurnOn: boolean;
};

/** The switch that opts in to (or out of) the weekly "problems you still owe" email.
 *  It is the bare control: the page that mounts it supplies the title and the explanation.
 *  The email goes to the account's own address, so there is nothing to type here. */
export default function ReminderSettings() {
  const { data, mutate } = useSWR<ReminderStatus>(
    "/api/reminders",
    swrFetcher,
    { revalidateOnFocus: false },
  );
  const { user } = useUser();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  // The account email was just added or confirmed elsewhere on the page.
  useEffect(() => {
    void mutate();
  }, [user?.email, user?.emailVerified, mutate]);

  const on = data?.on ?? false;
  const toggle = async () => {
    setBusy(true);
    try {
      const next = await apiFetcher<ReminderStatus>("/api/reminders", {
        method: on ? "DELETE" : "PUT",
      });
      await mutate(next, false);
      toast({
        title: next.on ? "Weekly reminder is on." : "Weekly reminder is off.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Your reminder was not saved.",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  // Off, and no confirmed account email to send to: that comes first.
  const needsEmail = !!data && !on && !data.canTurnOn;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
      <p className="t-sm t-muted min-w-0">
        {!data ? (
          "Loading…"
        ) : on ? (
          <>
            Sent to <b className="break-all text-ink">{data.email}</b>
          </>
        ) : needsEmail ? (
          <>
            Add your{" "}
            <Link href="/settings#settings-account" className="t-link">
              account email
            </Link>{" "}
            first: it is sent there.
          </>
        ) : (
          <>
            Will be sent to <b className="break-all text-ink">{user?.email}</b>
          </>
        )}
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="Weekly reminder"
        disabled={!data || busy || needsEmail}
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

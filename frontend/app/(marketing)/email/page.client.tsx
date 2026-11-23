"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import MemberPageState from "@/components/features/profile/MemberPageState";
import { resolveApiUrl } from "@/lib/apiClient";

const copy = {
  confirm: {
    title: "Confirm your reminder email",
    description: "You'll get one email a week while problems are waiting in your upsolve list.",
    button: "Confirm email",
    done: "You're set. Your first reminder is on its way.",
  },
  unsubscribe: {
    title: "Stop weekly reminders",
    description: "We'll remove your address and stop sending reminder emails.",
    button: "Stop emails",
    done: "Done. You won't get any more reminder emails.",
  },
};

/** Landing page for the links in confirmation and reminder emails. */
export default function EmailLinkClient({ action, token }: { action?: string; token?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const text = action === "confirm" || action === "unsubscribe" ? copy[action] : null;

  // The change waits for a click so mail scanners that open links can't trigger it.
  const redeem = async () => {
    setState("busy");
    try {
      const res = await fetch(resolveApiUrl("/api/reminders/redeem"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <main id="main-content" className="mx-auto flex min-h-[70dvh] w-full max-w-xl items-center px-5 py-16">
      {!text || !token || state === "error" ? (
        <MemberPageState kind="error" title="This link didn't work" description="It may have expired. You can manage reminders from your profile's Account tab." className="w-full">
          <Button asChild variant="outline"><Link href="/profile">Open profile</Link></Button>
        </MemberPageState>
      ) : state === "done" ? (
        <MemberPageState title={text.done} className="w-full">
          <Button asChild><Link href="/upsolve">Open your upsolve list</Link></Button>
        </MemberPageState>
      ) : (
        <MemberPageState title={text.title} description={text.description} className="w-full">
          <Button onClick={redeem} disabled={state === "busy"}>{state === "busy" ? "Working…" : text.button}</Button>
        </MemberPageState>
      )}
    </main>
  );
}

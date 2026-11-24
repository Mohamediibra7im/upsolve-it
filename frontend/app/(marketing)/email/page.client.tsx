"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveApiUrl } from "@/lib/apiClient";

const copy = {
  confirm: {
    title: "Confirm your reminder email",
    description:
      "You’ll get one email a week while problems are waiting in your upsolve queue.",
    button: "Confirm email",
    done: "Reminders are on.",
    doneDescription:
      "The first one arrives when problems are waiting in your upsolve queue.",
  },
  unsubscribe: {
    title: "Stop weekly reminders",
    description:
      "We’ll stop sending the weekly reminder. Your account and its email stay as they are.",
    button: "Stop emails",
    done: "Reminders are off.",
    doneDescription: "You won’t get any more reminder emails.",
  },
};

/** Landing page for the links in confirmation and reminder emails. */
export default function EmailLinkClient({
  action,
  token,
}: {
  action?: string;
  token?: string;
}) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(
    "idle",
  );
  const text =
    action === "confirm" || action === "unsubscribe" ? copy[action] : null;
  const failed = !text || !token || state === "error";

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
    <div className="wrap grid min-h-[70dvh] place-items-center py-16">
      <section className="u-panel w-full max-w-lg" aria-live="polite">
        <div className="u-panel__head">
          <p className="t-eyebrow">Weekly upsolve reminder</p>
          {failed ? (
            <Badge variant="failed">
              <X aria-hidden="true" />
              Link not valid
            </Badge>
          ) : (
            state === "done" && (
              <Badge variant="solved">
                <Check aria-hidden="true" />
                Done
              </Badge>
            )
          )}
        </div>
        <div className="u-panel__body grid justify-items-start gap-4">
          {failed ? (
            <>
              <h1 className="t-h1">This link didn’t work.</h1>
              <p className="t-muted">
                It may have expired. You can manage reminders from the Account
                tab of your profile.
              </p>
              <Button asChild variant="outline">
                <Link href="/settings">Open your settings</Link>
              </Button>
            </>
          ) : state === "done" ? (
            <>
              <h1 className="t-h1">{text.done}</h1>
              <p className="t-muted">{text.doneDescription}</p>
              <Button asChild>
                <Link href="/upsolve">Open your upsolve queue</Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="t-h1">{text.title}</h1>
              <p className="t-muted">{text.description}</p>
              <Button onClick={redeem} disabled={state === "busy"}>
                {state === "busy" ? "Working…" : text.button}
              </Button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

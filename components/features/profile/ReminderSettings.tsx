"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";

type ReminderStatus = { email: string | null; verified: boolean };

/** Opt in to (or out of) the weekly "problems you still owe" email. */
export default function ReminderSettings() {
  const { data, mutate } = useSWR<ReminderStatus>("/api/reminders", swrFetcher, {
    revalidateOnFocus: false,
  });
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (request: RequestInit, done: string) => {
    setBusy(true);
    try {
      const next = await apiFetcher<ReminderStatus>("/api/reminders", request);
      await mutate(next, false);
      setEmail("");
      toast({ title: done });
    } catch {
      toast({
        title: "That didn't work",
        description: "Check the address and try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    void save(
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
      "Check your inbox to confirm",
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Mail size={14} className="text-primary" />
        Weekly reminder
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        One email a week listing the problems still waiting in your upsolve
        list. Nothing is sent when your list is clear.
      </p>
      {data?.email ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-all text-sm text-foreground">
            {data.email}
            <span className="ml-2 text-xs text-muted-foreground">
              {data.verified ? "Active" : "Waiting for you to confirm"}
            </span>
          </p>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => save({ method: "DELETE" }, "Reminders turned off")}
            className="h-10 rounded-lg text-xs"
          >
            Turn off
          </Button>
        </div>
      ) : (
        <form onSubmit={subscribe} className="flex flex-wrap gap-3">
          <label htmlFor="reminder-email" className="sr-only">
            Email address
          </label>
          <Input
            id="reminder-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg text-sm"
          />
          <Button type="submit" disabled={busy} className="h-10 rounded-lg text-xs">
            Send me reminders
          </Button>
        </form>
      )}
    </div>
  );
}

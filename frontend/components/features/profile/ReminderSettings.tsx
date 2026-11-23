"use client";

import { useState, type FormEvent } from "react";
import useSWR from "swr";
import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetcher, swrFetcher } from "@/lib/apiClient";
import { useToast } from "@/components/providers/Toast";

type ReminderStatus = { email: string | null; verified: boolean };

/** The control that opts in to (or out of) the weekly "problems you still owe" email.
 *  It is the bare control: the page that mounts it supplies the title and the explanation. */
export default function ReminderSettings() {
  const { data, mutate } = useSWR<ReminderStatus>(
    "/api/reminders",
    swrFetcher,
    {
      revalidateOnFocus: false,
    },
  );
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (request: RequestInit, done: string) => {
    setBusy(true);
    try {
      const next = await apiFetcher<ReminderStatus>("/api/reminders", request);
      await mutate(next, false);
      setEmail("");
      toast({ title: done, variant: "success" });
    } catch {
      toast({
        title: "Your reminder was not saved.",
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
      "Check your inbox to confirm.",
    );
  };

  if (data?.email) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="t-sm min-w-0 break-all">{data.email}</span>
        {data.verified ? (
          <Badge variant="solved">
            <Check />
            Active
          </Badge>
        ) : (
          <Badge variant="pending">
            <Clock />
            Confirm in your inbox
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => save({ method: "DELETE" }, "Reminders turned off.")}
        >
          Turn off reminders
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={subscribe}
      className="flex w-full flex-wrap gap-2 sm:w-auto"
    >
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
        className="h-10 min-w-0 flex-1 sm:w-64"
      />
      <Button type="submit" variant="secondary" disabled={busy}>
        Send me reminders
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Check, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/auth";
import { apiClient } from "@/lib/apiClient";
import type { User } from "@/types/User";
import { FormError, TextField } from "./AuthFrame";

const reason = (err: unknown) =>
  err instanceof Error && err.message
    ? err.message
    : "We could not reach the server. Try again in a minute.";

/**
 * The account's own email, in Settings: add one, confirm it with the mailed
 * code, or correct it while it is still unconfirmed. Once confirmed it logs
 * the account in and resets its password.
 */
export default function AccountEmail() {
  const { user, setUser } = useUser();
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  if (!user) return null;

  const run = async (
    call: () => Promise<{ user: User }>,
    done?: string,
  ): Promise<void> => {
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const res = await call();
      setUser(res.user);
      setEditing(false);
      setCode("");
      setNote(done ?? null);
    } catch (err) {
      setError(reason(err));
    } finally {
      setBusy(false);
    }
  };

  if (user.email && user.emailVerified) {
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <b className="truncate">{user.email}</b>
        <Badge variant="solved">
          <Check />
          Confirmed
        </Badge>
      </div>
    );
  }

  if (user.email && !editing) {
    return (
      <form
        className="grid w-full max-w-sm gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\d{6}$/.test(code)) {
            setError("The code is the 6 digits from the email.");
            return;
          }
          void run(() =>
            apiClient.post<{ user: User }>("/api/auth/email/confirm", { code }),
          );
        }}
      >
        <p className="t-sm t-muted">
          We sent a 6-digit code to <b className="text-ink">{user.email}</b>. It
          lasts 10 minutes.
        </p>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <div className="u-field">
            <label htmlFor="account-email-code">Code from the email</label>
            <input
              id="account-email-code"
              className="u-input t-num tracking-[0.3em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <Button type="submit" disabled={busy} className="h-11">
            {busy ? "Checking…" : "Confirm"}
          </Button>
        </div>
        {error && <FormError>{error}</FormError>}
        {note && (
          <p role="status" className="t-sm text-solved">
            {note}
          </p>
        )}
        <p className="t-sm t-muted">
          <button
            type="button"
            className="t-link"
            disabled={busy}
            onClick={() =>
              void run(
                () => apiClient.post<{ user: User }>("/api/auth/email/resend"),
                "A new code is on its way.",
              )
            }
          >
            Send it again
          </button>{" "}
          or{" "}
          <button
            type="button"
            className="t-link"
            onClick={() => {
              setAddress("");
              setError(null);
              setEditing(true);
            }}
          >
            use another address
          </button>
          .
        </p>
      </form>
    );
  }

  return (
    <form
      className="grid w-full max-w-sm gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void run(
          () =>
            apiClient.post<{ user: User }>("/api/auth/email", {
              email: address.trim(),
            }),
          "Code sent.",
        );
      }}
    >
      <TextField
        id="account-email"
        label="Email"
        icon={<Mail />}
        type="email"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
      />
      {error && <FormError>{error}</FormError>}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send me a code"}
        </Button>
        {editing && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setError(null);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

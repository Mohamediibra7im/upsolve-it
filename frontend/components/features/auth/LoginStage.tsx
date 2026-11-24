"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, History, Lock, User } from "lucide-react";
import BrandIcon from "@/components/shared/BrandIcon";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/auth";
import { apiFetcher } from "@/lib/apiClient";
import { FormError, PasswordField, TextField } from "./AuthFrame";
import AuthStage, { WorksWith } from "./AuthStage";

type Upcoming = {
  contests: {
    judge: "codeforces" | "atcoder";
    name: string;
    startsAt: string;
  }[];
};

/** The next round on either judge, counting down. A plain link until it loads;
 *  both take the same height, so the form above does not move when it does. */
function NextContest() {
  const { data } = useSWR<Upcoming>("/api/contests/upcoming", apiFetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 600_000,
  });
  const next = data?.contests?.[0];
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!next) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [next]);

  if (!next) {
    return (
      <Link href="/contests" className="grid min-h-[108px] content-end gap-1">
        <span className="t-eyebrow">Upcoming rounds</span>
        <span className="t-sm t-muted">
          Codeforces and AtCoder in one calendar.
        </span>
      </Link>
    );
  }
  const left = Math.max(
    0,
    Math.floor((Date.parse(next.startsAt) - now) / 1000),
  );
  const parts = [
    ["Days", Math.floor(left / 86400)],
    ["Hrs", Math.floor(left / 3600) % 24],
    ["Min", Math.floor(left / 60) % 60],
    ["Sec", left % 60],
  ] as const;
  return (
    <Link
      href="/contests"
      className="grid min-h-[108px] min-w-0 content-end gap-2"
    >
      <span className="t-eyebrow">Next contest starts in</span>
      <span
        role="timer"
        aria-live="off"
        aria-label={parts.map(([unit, n]) => `${n} ${unit}`).join(", ")}
        className="flex gap-1.5"
      >
        {parts.map(([unit, n]) => (
          <span
            key={unit}
            aria-hidden="true"
            className="grid min-w-[54px] justify-items-center gap-1 rounded-sm border border-line bg-surface px-1.5 py-2"
          >
            <b className="t-num text-2xl font-semibold leading-none tracking-tight">
              {String(n).padStart(2, "0")}
            </b>
            <small className="font-mono text-[10px] font-semibold uppercase leading-none tracking-widest text-ink-faint">
              {unit}
            </small>
          </span>
        ))}
      </span>
      <span className="t-sm t-muted flex min-w-0 items-center gap-1.5">
        <BrandIcon name={next.judge} />
        <span className="truncate">{next.name}</span>
      </span>
    </Link>
  );
}

/** The login page: the form on a raised sheet, in the middle of a heatmap ground. */
export default function LoginStage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setIsLoading(true);
    try {
      // On success the route guard opens the dashboard, or the sign-up step
      // an unfinished account still has to do.
      const response = await login(name.trim(), password);
      if (!response.success)
        setError(response.error || "Something went wrong. Try again.");
    } catch {
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthStage
      aside={
        <p className="t-sm t-muted flex items-center gap-2.5">
          New here?
          <Button asChild variant="outline" size="sm">
            <Link href="/signup">Create an account</Link>
          </Button>
        </p>
      }
      foot={
        <>
          <NextContest />
          <WorksWith />
        </>
      }
    >
      <header className="grid gap-2">
        <p className="t-eyebrow">Log in</p>
        <h1 className="t-h1">Welcome back.</h1>
        <p className="t-muted">
          Every square behind this form is a day of practice. Add today&apos;s.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <TextField
          id="login"
          label="Username or email"
          icon={<User />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. mona_adel"
          autoComplete="username"
        />
        <PasswordField
          id="password"
          label="Password"
          icon={<Lock />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          action={
            <Link href="/reset-password" className="t-link font-medium">
              Forgot password?
            </Link>
          }
        />
        {error && <FormError>{error}</FormError>}
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? "Logging in…" : "Log in"}
          {!isLoading && <ArrowRight />}
        </Button>
      </form>

      {/* For everyone who signed up when the first field said "Codeforces handle". */}
      <aside className="u-panel u-panel--sunk grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 p-4">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground"
        >
          <History className="size-5" />
        </span>
        <div className="grid gap-1">
          <h2 className="text-[15px] font-semibold leading-5">
            Signed up before? Nothing to redo.
          </h2>
          <p className="t-sm t-muted">
            Your <b className="text-ink">Codeforces handle</b> is your username
            now. Type it above with the password you already have. To log in by
            email too, add one in Settings.
          </p>
        </div>
      </aside>
    </AuthStage>
  );
}

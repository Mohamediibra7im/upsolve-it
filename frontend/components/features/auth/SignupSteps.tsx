"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Lock,
  Mail,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import Brand from "@/components/layout/Brand";
import BrandIcon from "@/components/shared/BrandIcon";
import { Button } from "@/components/ui/button";
import { Rank } from "@/components/ui/kit";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useUser } from "@/hooks/auth";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import type { User } from "@/types/User";
import { validatePassword } from "@/utils/passwordValidation";
import { signupStep } from "@/utils/signupStep";
import {
  FormError,
  PasswordField,
  TextField,
  VerificationCode,
} from "./AuthFrame";

const USERNAME = /^[A-Za-z0-9_]{3,24}$/;
const RESEND_WAIT_MS = 60_000;

const reason = (err: unknown) =>
  err instanceof Error && err.message
    ? err.message
    : "We could not reach the server. Try again in a minute.";

/** One line of the sheet: its number, its name, and its form while it is the current step. */
function Step({
  n,
  title,
  summary,
  state,
  children,
}: {
  n: number;
  title: string;
  summary: ReactNode;
  state: "done" | "now" | "wait";
  children: ReactNode;
}) {
  return (
    <section
      aria-current={state === "now" ? "step" : undefined}
      className="border-t border-line first:border-t-0"
    >
      <div
        className={cn(
          "grid grid-cols-[32px_minmax(0,1fr)] items-center gap-3.5 px-5 py-[18px] sm:px-6",
          state === "wait" && "text-ink-muted",
        )}
      >
        <span
          className={cn(
            "u-step",
            state === "done" && "bg-primary text-primary-foreground",
            state === "now" &&
              "border border-primary bg-transparent text-accent-ink",
            state === "wait" &&
              "border border-line-strong bg-transparent text-ink-muted",
          )}
        >
          {state === "done" ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              <span className="sr-only">Done:</span>
            </>
          ) : (
            n
          )}
        </span>
        <div className="min-w-0">
          <h2 className="t-h2 text-[22px] leading-tight">{title}</h2>
          <p className="t-sm t-muted truncate">{summary}</p>
        </div>
      </div>
      {state === "now" && (
        <div className="grid gap-5 px-5 pb-7 sm:pl-[70px] sm:pr-6">
          {children}
        </div>
      )}
    </section>
  );
}

/** Step 1: the account itself. */
function AccountForm({ onSent }: { onSent: () => void }) {
  const { register } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!USERNAME.test(username.trim())) {
      setError("A username is 3 to 24 letters, digits or underscores.");
      return;
    }
    const check = validatePassword(password);
    if (!check.isValid) {
      setError(check.errors.join(". "));
      return;
    }
    setBusy(true);
    const res = await register(username.trim(), email.trim(), password);
    setBusy(false);
    if (res.success) onSent();
    else setError(res.error || "Something went wrong. Try again.");
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      <TextField
        id="username"
        label="Username"
        icon={<UserIcon />}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. mona_adel"
        autoComplete="username"
        maxLength={24}
        hint="Your name on Upsolve It. 3 to 24 letters, digits or underscores."
      />
      <TextField
        id="email"
        label="Email"
        icon={<Mail />}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        hint="For resetting your password. We send a code to confirm it."
      />
      <PasswordField
        id="password"
        label="Password"
        icon={<Lock />}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="8+ characters, with a number and a symbol"
        autoComplete="new-password"
      >
        <PasswordStrengthIndicator password={password} />
      </PasswordField>
      {error && <FormError>{error}</FormError>}
      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="justify-self-start"
      >
        {busy ? "Creating your account…" : "Continue"}
        {!busy && <ArrowRight />}
      </Button>
    </form>
  );
}

/** Step 2: the 6-digit code from the email, with a way to resend it or fix the address. */
function EmailForm({
  user,
  sentAt,
  onSent,
}: {
  user: User;
  sentAt: number;
  onSent: () => void;
}) {
  const { setUser } = useUser();
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<"confirm" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const wait = Math.max(0, Math.ceil((sentAt + RESEND_WAIT_MS - now) / 1000));
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const run = async (
    kind: "confirm" | "send",
    call: () => Promise<{ user: User }>,
  ) => {
    setError(null);
    setNote(null);
    setBusy(kind);
    try {
      const res = await call();
      if (kind === "send") {
        onSent();
        setNow(Date.now());
        setEditing(false);
        setCode("");
        setNote("A new code is on its way.");
      }
      setUser(res.user);
    } catch (err) {
      setError(reason(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <p className="t-muted">
        We sent a 6-digit code to <b className="text-ink">{user.email}</b>. It
        lasts 10 minutes.
      </p>
      <form
        className="grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^\d{6}$/.test(code)) {
            setError("The code is the 6 digits from the email.");
            return;
          }
          void run("confirm", () =>
            apiClient.post<{ user: User }>("/api/auth/email/confirm", { code }),
          );
        }}
      >
        <div className="u-field">
          <label htmlFor="code">Code from the email</label>
          <input
            id="code"
            className="u-input u-input--code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
        </div>
        {error && <FormError>{error}</FormError>}
        {note && (
          <p role="status" className="t-sm text-solved">
            {note}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={busy !== null}
          className="justify-self-start"
        >
          {busy === "confirm" ? "Checking…" : "Confirm email"}
          {busy !== "confirm" && <ArrowRight />}
        </Button>
      </form>

      {editing ? (
        <form
          className="grid gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void run("send", () =>
              apiClient.post<{ user: User }>("/api/auth/email", {
                email: address.trim(),
              }),
            );
          }}
        >
          <TextField
            id="new-email"
            label="The right address"
            icon={<Mail />}
            type="email"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={busy !== null}
            className="h-12"
          >
            {busy === "send" ? "Sending…" : "Send the code there"}
          </Button>
        </form>
      ) : (
        <p className="t-sm t-muted">
          Nothing arrived?{" "}
          {wait > 0 ? (
            <>Send it again in 0:{String(wait).padStart(2, "0")}</>
          ) : (
            <button
              type="button"
              className="t-link"
              disabled={busy !== null}
              onClick={() =>
                void run("send", () =>
                  apiClient.post<{ user: User }>("/api/auth/email/resend"),
                )
              }
            >
              Send it again
            </button>
          )}
          , or{" "}
          <button
            type="button"
            className="t-link"
            onClick={() => {
              setAddress("");
              setEditing(true);
            }}
          >
            change the address
          </button>
          .
        </p>
      )}
    </>
  );
}

/**
 * One judge. First its handle is typed and looked up; then the code is pasted
 * into the named field of the judge's profile and read back from there.
 */
function JudgeRow({
  judge,
  name,
  field,
  settingsUrl,
  handle,
  verified,
  detail,
  canVerify,
  onConnect,
  onVerify,
}: {
  judge: "codeforces" | "atcoder";
  name: string;
  /** The profile field on the judge that takes the code. */
  field: string;
  settingsUrl: string;
  handle?: string;
  verified: boolean;
  detail?: ReactNode;
  /** False while there is no live code to paste. */
  canVerify: boolean;
  onConnect: (handle: string) => Promise<void>;
  onVerify: () => Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (work: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await work();
    } catch (err) {
      setError(reason(err));
    } finally {
      setBusy(false);
    }
  };
  const connected = Boolean(handle) && !editing;

  return (
    <li className="grid gap-3 border-b border-line py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <label
          htmlFor={`judge-${judge}`}
          className="inline-flex items-center gap-2 text-[15px] font-semibold"
        >
          <BrandIcon name={judge} />
          {name}
        </label>
        {verified ? (
          <span className="u-badge u-badge--solved">
            <Check aria-hidden="true" />
            Verified
          </span>
        ) : (
          connected && <span className="u-badge">Not verified yet</span>
        )}
      </div>

      {connected ? (
        <>
          <p className="t-sm flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <b className="truncate text-[15px]">{handle}</b>
            {detail}
            {!verified && (
              <button
                type="button"
                className="t-link"
                onClick={() => {
                  setTyped(handle ?? "");
                  setError(null);
                  setEditing(true);
                }}
              >
                Change
              </button>
            )}
          </p>
          {!verified && (
            <>
              <p className="t-sm t-muted">
                Paste the code into <b className="text-ink">{field}</b> on your{" "}
                {name} profile and save. Then verify here and put it back.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  disabled={busy || !canVerify}
                  onClick={() => void run(onVerify)}
                >
                  {busy ? "Checking your profile…" : `Verify ${name}`}
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={settingsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open {name} settings
                    <ExternalLink />
                  </a>
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <form
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              await onConnect(typed.trim());
              setEditing(false);
            });
          }}
        >
          <input
            id={`judge-${judge}`}
            className="u-input"
            required
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={`Your ${name} handle, e.g. mona_adel`}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
          />
          <Button type="submit" variant="outline" disabled={busy}>
            {busy ? "Looking it up…" : "Connect"}
          </Button>
        </form>
      )}
      {error && <FormError>{error}</FormError>}
    </li>
  );
}

/**
 * Step 3: connect a judge and show the handle is theirs, in one place. One
 * code serves both judges; one proven judge is enough to enter the app.
 */
function JudgesForm({ user }: { user: User }) {
  const { setUser, generateVerificationCode } = useUser();
  // What the server returned while connecting and verifying. It reaches the
  // rest of the app only on "Start training", so a second judge can be added.
  const [draft, setDraft] = useState<User>(user);
  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [gettingCode, setGettingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const requestCode = async () => {
    setCodeError(null);
    setGettingCode(true);
    const res = await generateVerificationCode();
    setGettingCode(false);
    if (res.success) {
      setCode(res.data.code);
      setExpiresAt(res.data.expiresAt);
      setNow(Date.now());
    } else setCodeError(res.error || "We could not create a code. Try again.");
  };
  // The code is asked for once when the step opens, not on every render.
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void requestCode();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const secondsLeft = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const live = Boolean(code) && secondsLeft > 0;

  const post = async (path: string, body?: object) => {
    const res = await apiClient.post<{ user: User }>(path, body);
    setDraft(res.user);
  };
  const ready = draft.isVerified || draft.atcoderVerified;

  return (
    <>
      <div className="u-panel u-panel--sunk grid gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-sm bg-primary text-primary-foreground"
        >
          <ShieldCheck className="size-6" />
        </span>
        <div className="grid gap-0.5">
          <h3 className="t-h2 text-xl leading-tight">Add at least one judge</h3>
          <p className="t-sm t-muted">
            Codeforces, AtCoder, or both. We check each handle is really yours,
            so nobody can train under someone else&apos;s name. We never ask for
            their passwords.
          </p>
        </div>
        <span
          role="status"
          className={cn(
            "u-badge",
            ready ? "u-badge--solved" : "u-badge--pending",
          )}
        >
          {ready && <Check aria-hidden="true" />}
          {ready ? "Ready" : "0 of 1 verified"}
        </span>
      </div>

      {live ? (
        <VerificationCode code={code} secondsLeft={secondsLeft} />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={gettingCode}
            onClick={requestCode}
          >
            {gettingCode ? "Getting your code…" : "Get a new code"}
          </Button>
          {code && <p className="t-sm t-muted">That code ran out of time.</p>}
        </div>
      )}
      {codeError && <FormError>{codeError}</FormError>}
      <p className="t-sm t-muted -mt-2">
        The same code works for both judges, for as long as the clock runs.
      </p>

      <ul className="border-t border-line">
        <JudgeRow
          judge="codeforces"
          name="Codeforces"
          field="First name"
          settingsUrl="https://codeforces.com/settings/social"
          handle={draft.codeforcesHandle}
          verified={draft.isVerified}
          detail={
            draft.codeforcesHandle && <Rank rating={draft.rating} showRating />
          }
          canVerify={live}
          onConnect={(handle) =>
            post("/api/auth/connect-codeforces", { handle })
          }
          onVerify={() => post("/api/auth/verify-codeforces-profile")}
        />
        <JudgeRow
          judge="atcoder"
          name="AtCoder"
          field="Affiliation"
          settingsUrl="https://atcoder.jp/settings"
          handle={draft.links?.atcoder || undefined}
          verified={draft.atcoderVerified}
          canVerify={live}
          onConnect={(handle) => post("/api/auth/connect-atcoder", { handle })}
          onVerify={() => post("/api/auth/verify-atcoder-profile")}
        />
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="lg" disabled={!ready} onClick={() => setUser(draft)}>
          Start training
          <ArrowRight />
        </Button>
        {!ready && (
          <p className="t-sm t-muted">Verify one judge to continue.</p>
        )}
      </div>
    </>
  );
}

// ---------- the side: real parts of the app, as a look ahead ----------
const SLOTS = [
  ["A", 1200, "pupil", "Solved"],
  ["B", 1400, "specialist", "Solved"],
  ["C", 1500, "specialist", "Next"],
  ["D", 1700, "expert", "Next"],
] as const;
const ROUNDS = [
  ["Sunday Div. 2 round", "CDE"],
  ["Saturday beginner contest", "EF"],
] as const;
const STREAK = [
  0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 1, 2, 0, 1, 3, 4, 2, 1, 0, 2, 3, 3, 4, 2, 4,
];

function Perks() {
  return (
    <aside className="grid min-w-0 lg:pt-[104px]">
      <p className="t-eyebrow pb-3">What the account gives you</p>
      <div className="grid gap-2.5 border-t border-line py-[18px]">
        <h3 className="t-h2 text-xl">A set for today</h3>
        <div className="grid grid-cols-4 gap-2">
          {SLOTS.map(([letter, rating, rank, state]) => (
            <div
              key={letter}
              className={cn(
                "grid gap-1.5 rounded-sm border p-3",
                state === "Solved"
                  ? "border-solved bg-solved-soft text-solved"
                  : "border-line bg-surface-sunk",
              )}
            >
              <b className="font-heading text-[32px] font-extrabold leading-none">
                {letter}
              </b>
              <span
                className="t-num t-sm font-semibold leading-none"
                style={{ color: `var(--rank-${rank})` }}
              >
                {rating}
              </span>
              <small className="font-mono text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {state}
              </small>
            </div>
          ))}
        </div>
        <p className="t-sm t-muted">
          Four problems matched to your level, with a clock.
        </p>
      </div>
      <div className="grid gap-1 border-t border-line py-[18px]">
        <h3 className="t-h2 text-xl">A queue of what you missed</h3>
        <ul>
          {ROUNDS.map(([round, left], i) => (
            <li
              key={round}
              className={cn(
                "flex items-center justify-between gap-3 py-2.5",
                i > 0 && "border-t border-line",
              )}
            >
              <span className="min-w-0">
                <b className="block truncate text-sm">{round}</b>
                <small className="t-eyebrow text-[11px]">
                  {left.length} to upsolve
                </small>
              </span>
              <span className="flex flex-none gap-1">
                {[...left].map((letter) => (
                  <span
                    key={letter}
                    className="grid size-7 place-items-center rounded-sm border border-line-strong font-mono text-xs font-semibold"
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-2.5 border-t border-line py-[18px]">
        <h3 className="t-h2 text-xl">A streak worth keeping</h3>
        <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-[3px]">
          {STREAK.map((level, i) => (
            <i
              key={i}
              className="aspect-square rounded-[1px]"
              style={{ background: `var(--heat-${level})` }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

/** The sign-up page: one sheet over a volt band holds the three steps. */
export default function SignupSteps() {
  const { user, isLoading, syncProfile, logout } = useUser();
  const [sentAt, setSentAt] = useState(0);
  const step = isLoading ? -1 : signupStep(user);
  const stateOf = (n: number) =>
    step === 0 || (step > 0 && n < step) ? "done" : n === step ? "now" : "wait";

  // Someone coming back to an unfinished sign-up may have a stale copy of
  // their account here: ask the server once what is already done.
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current || isLoading) return;
    asked.current = true;
    if (user) void syncProfile();
  }, [isLoading, user, syncProfile]);

  return (
    <div className="grid grid-rows-[auto_1fr]">
      <div className="u-inverse">
        <div className="mx-auto grid w-full max-w-[var(--container)] gap-6 px-[var(--gutter)] pb-28 pt-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" aria-label="Upsolve It home">
              <Brand />
            </Link>
            {user ? (
              <p className="t-sm">
                Signed in as <b>{user.username}</b>.{" "}
                <button
                  type="button"
                  className="t-link"
                  onClick={() => void logout()}
                >
                  Log out
                </button>
              </p>
            ) : (
              <p className="t-sm">
                Already have an account?{" "}
                <Link href="/login" className="t-link">
                  Log in
                </Link>
              </p>
            )}
          </div>
          <h1 className="t-d2 max-w-[16ch]">Create your account.</h1>
        </div>
      </div>

      <div className="mx-auto -mt-20 grid w-full max-w-[var(--container)] items-start gap-[var(--gutter)] px-[var(--gutter)] pb-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="u-panel u-panel--stage">
          <Step
            n={1}
            title="Account"
            state={stateOf(1)}
            summary={
              user
                ? [user.username, user.email].filter(Boolean).join(" · ")
                : "A username, an email and a password."
            }
          >
            <AccountForm onSent={() => setSentAt(Date.now())} />
          </Step>
          <Step
            n={2}
            title="Confirm your email"
            state={stateOf(2)}
            summary={
              user?.emailVerified
                ? "Confirmed"
                : user && !user.email
                  ? "No email on this account yet."
                  : "One code, so you can always get back in."
            }
          >
            {user && (
              <EmailForm
                user={user}
                sentAt={sentAt}
                onSent={() => setSentAt(Date.now())}
              />
            )}
          </Step>
          <Step
            n={3}
            title="Connect and verify your judges"
            state={stateOf(3)}
            summary="Codeforces, AtCoder, or both. One is enough."
          >
            {user && <JudgesForm user={user} />}
          </Step>
        </div>
        <Perks />
      </div>
    </div>
  );
}

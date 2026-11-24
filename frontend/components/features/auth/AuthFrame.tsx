"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { Check, CircleAlert, Copy, Eye, EyeOff } from "lucide-react";
import Brand from "@/components/layout/Brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The volt half. With `current` (1-based) the points are numbered steps:
 *  earlier ones read as done, later ones as waiting. Without it they are plain check lines. */
export type Slab = {
  eyebrow: string;
  statement: string;
  points: string[];
  current?: number;
  note?: string;
};

/** The split frame: the form on the ground half, a full-height volt statement on the other.
 *  Below `lg` the halves stack and the slab shrinks to its eyebrow and statement. */
export function AuthSplit({
  step,
  title,
  lead,
  slab,
  footnote,
  children,
}: {
  step?: string;
  title: string;
  lead: ReactNode;
  slab: Slab;
  footnote?: ReactNode;
  children: ReactNode;
}) {
  const { current } = slab;
  const List = current === undefined ? "ul" : "ol";
  return (
    <div className="grid grid-rows-[1fr_auto] lg:grid-cols-2 lg:grid-rows-1">
      <div className="grid grid-rows-[auto_1fr_auto] gap-10 px-[var(--gutter)] py-10">
        <Link
          href="/"
          aria-label="Upsolve It home"
          className="justify-self-start"
        >
          <Brand />
        </Link>
        <section className="grid w-full max-w-[420px] gap-5 self-center justify-self-center">
          <header className="grid gap-2">
            {step && <p className="t-eyebrow">{step}</p>}
            <h1 className="t-h1">{title}</h1>
            <p className="t-muted">{lead}</p>
          </header>
          {children}
        </section>
        <p className="t-sm t-muted">
          {footnote ?? (
            <>
              Need a Codeforces account?{" "}
              <a
                href="https://codeforces.com/register"
                target="_blank"
                rel="noopener noreferrer"
                className="t-link"
              >
                Create one here
              </a>
            </>
          )}
        </p>
      </div>
      <aside className="u-inverse grid content-between gap-10 px-[var(--gutter)] py-10">
        <p className="t-eyebrow">{slab.eyebrow}</p>
        <div className="grid gap-8">
          <h2 className="t-d1 text-[length:clamp(40px,6vw,86px)]">
            {slab.statement}
          </h2>
          <List className="hidden gap-3.5 lg:grid">
            {slab.points.map((point, i) => {
              const done = current !== undefined && i + 1 < current;
              const waiting = current !== undefined && i + 1 > current;
              return (
                <li
                  key={point}
                  aria-current={i + 1 === current ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-3",
                    i + 1 === current && "font-semibold",
                    waiting && "text-ink-muted",
                  )}
                >
                  {current === undefined ? (
                    <Check className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <span
                      className={cn(
                        "u-step",
                        waiting &&
                          "border border-line-strong bg-transparent text-ink-muted",
                      )}
                    >
                      {done ? (
                        <>
                          <Check className="size-4" aria-hidden="true" />
                          <span className="sr-only">Done:</span>
                        </>
                      ) : (
                        i + 1
                      )}
                    </span>
                  )}
                  {point}
                </li>
              );
            })}
          </List>
        </div>
        <p className="t-sm t-muted hidden lg:block">
          {slab.note ?? "Free to use. Built by competitive programmers."}
        </p>
      </aside>
    </div>
  );
}

/** A labelled input with a leading icon. `hint` sits under it, `action` ends the label row. */
export function TextField({
  id,
  label,
  icon,
  hint,
  action,
  className,
  ...input
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  icon: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="u-field">
      <span className="flex items-baseline justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        {action}
      </span>
      <span className="u-field__box">
        <span className="u-field__icon [&>svg]:size-4" aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type="text"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={cn("u-input", className)}
          {...input}
        />
      </span>
      {hint && <span className="u-hint">{hint}</span>}
    </div>
  );
}

export function HandleField(input: ComponentProps<"input">) {
  return (
    <div className="u-field">
      <label htmlFor="handle">Codeforces handle</label>
      <input
        id="handle"
        type="text"
        required
        placeholder="e.g. tourist"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="u-input"
        {...input}
      />
    </div>
  );
}

/** A password input with a show/hide switch. `action` sits at the end of the label row;
 *  children sit under the input (strength meter). */
export function PasswordField({
  id,
  label,
  icon,
  action,
  children,
  ...input
}: ComponentProps<"input"> & {
  id: string;
  label: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="u-field">
      <span className="flex items-baseline justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        {action}
      </span>
      <div className={cn("relative", icon && "u-field__box")}>
        {icon && (
          <span className="u-field__icon [&>svg]:size-4" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={shown ? "text" : "password"}
          required
          className="u-input pr-12"
          {...input}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShown(!shown)}
          aria-label={`${shown ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="u-btn--sm absolute right-1.5 top-1/2 -translate-y-1/2"
        >
          {shown ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {children}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="u-error t-sm flex items-start gap-2">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Countdown({ secondsLeft }: { secondsLeft: number }) {
  return (
    <span
      role="timer"
      aria-label="Time left"
      className="u-timer u-timer--sm"
      data-warn={secondsLeft <= 30 ? "" : undefined}
    >
      {String(Math.floor(secondsLeft / 60)).padStart(2, "0")}
      <small>m</small>
      {String(secondsLeft % 60).padStart(2, "0")}
      <small>s</small>
    </span>
  );
}

/** The code to paste into Codeforces: the code, a copy button and the time it has left. */
export function VerificationCode({
  code,
  secondsLeft,
}: {
  code: string;
  secondsLeft: number;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="u-panel u-panel--sunk grid gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="t-eyebrow">Your code</span>
        <Countdown secondsLeft={secondsLeft} />
      </div>
      <code className="t-num-lg select-all break-all">{code}</code>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copy}
        className="justify-self-start"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy code"}
      </Button>
    </div>
  );
}

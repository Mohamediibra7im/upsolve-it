"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink, Lock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useToast } from "@/components/providers/Toast";
import { validatePassword } from "@/utils/passwordValidation";
import {
  AuthStage,
  Countdown,
  FormError,
  PasswordField,
  TextField,
  VerificationCode,
  WorksWith,
} from "@/components/features/auth";
import { resolveApiUrl } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const stages = ["find", "prove", "password"] as const;
const stageNames = ["Find", "Prove", "New password"];

const post = (path: string, body: object) =>
  fetch(resolveApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stage, setStage] = useState<(typeof stages)[number]>("find");
  const [name, setName] = useState("");
  // How the account proves itself: a code by email, or one on its Codeforces profile.
  const [method, setMethod] = useState<"email" | "codeforces">("codeforces");
  const [sentTo, setSentTo] = useState("");
  const [canUseCodeforces, setCanUseCodeforces] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stage === "find" || expiresAt === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setError("The time to verify expired. Start again to get a new code.");
        setVerificationToken("");
        setResetToken("");
        setRecoveryCode("");
        setEmailCode("");
        setStage("find");
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [stage, expiresAt]);

  const start = async (via?: "codeforces") => {
    if (!name.trim()) {
      setError("Enter your username or email.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await post("/api/auth/initiate-reset", {
        handle: name.trim(),
        ...(via && { via }),
      });
      const data = await res.json();
      if (res.ok) {
        const deadline = new Date(data.expiresAt).getTime();
        const byEmail = data.method === "email";
        if (
          (!byEmail && !/^[a-f0-9]{32}$/.test(data.code)) ||
          !data.verificationToken ||
          !Number.isFinite(deadline) ||
          deadline <= Date.now()
        )
          throw new Error("Recovery service unavailable");
        setMethod(byEmail ? "email" : "codeforces");
        setSentTo(byEmail ? data.sentTo : "");
        setCanUseCodeforces(byEmail && data.canUseCodeforces === true);
        setVerificationToken(data.verificationToken);
        setRecoveryCode(byEmail ? "" : data.code);
        setEmailCode("");
        setExpiresAt(deadline);
        setCountdown(Math.ceil((deadline - Date.now()) / 1000));
        setStage("prove");
      } else {
        setError(data.message || "We could not start the reset. Try again.");
      }
    } catch (err) {
      console.error("Initiate reset error:", err);
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (method === "email" && !/^\d{6}$/.test(emailCode)) {
      setError("The code is the 6 digits from the email.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res =
        method === "email"
          ? await post("/api/auth/verify-reset-email", {
              verificationToken,
              code: emailCode,
            })
          : await post("/api/auth/verify-reset-profile", { verificationToken });

      const data = await res.json();
      if (res.ok) {
        const deadline = new Date(data.expiresAt).getTime();
        if (
          !data.resetToken ||
          !Number.isFinite(deadline) ||
          deadline <= Date.now()
        )
          throw new Error("Recovery proof expired");
        setResetToken(data.resetToken);
        setExpiresAt(deadline);
        setStage("password");
      } else {
        setError(
          data.message ||
            (method === "email"
              ? "That code is not right. Check the email and try again."
              : "We could not find the code on your profile. Save it on Codeforces, then verify again."),
        );
      }
    } catch (err) {
      console.error("Verify reset error:", err);
      setError("We could not reach the server. Verify again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await post("/api/auth/reset-password", {
        resetToken,
        newPassword,
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Password changed",
          description: "Log in with your new password.",
          variant: "success",
          durationMs: 4000,
        });

        setResetToken("");
        setVerificationToken("");
        setNewPassword("");
        setConfirmNewPassword("");
        setExpiresAt(null);
        setStage("find");
        router.push("/login");
      } else {
        setError(data.message || "We could not save the password. Try again.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  const current = stages.indexOf(stage);

  return (
    <AuthStage
      aside={
        <p className="t-sm t-muted flex items-center gap-2.5">
          Remembered it?
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        </p>
      }
      foot={
        <>
          <p className="t-sm t-muted">
            A code works for 10 minutes and only once.
          </p>
          <WorksWith />
        </>
      }
    >
      <ol className="grid grid-cols-3 gap-1.5">
        {stageNames.map((label, i) => (
          <li
            key={label}
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "t-eyebrow grid gap-2 before:h-1 before:content-['']",
              i <= current ? "before:bg-primary" : "before:bg-line",
              i === current && "text-ink",
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <header className="grid gap-2">
        <p className="t-eyebrow">Step {current + 1} of 3</p>
        <h1 className="t-h1">
          {
            {
              find: "Find your account.",
              prove: "Prove it is yours.",
              password: "Choose a new password.",
            }[stage]
          }
        </h1>
        <p className="t-muted">
          {stage === "find" &&
            "Type the username or the email you log in with."}
          {stage === "prove" && method === "email" && (
            <>
              We sent a 6-digit code to <b className="text-ink">{sentTo}</b>.
              Type it here.
            </>
          )}
          {stage === "prove" && method === "codeforces" && (
            <>
              Open your{" "}
              <a
                href="https://codeforces.com/settings/social"
                target="_blank"
                rel="noopener noreferrer"
                className="t-link inline-flex items-center gap-1"
              >
                Codeforces profile settings
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
              , set your <b className="text-ink">First name</b> to this code and
              save.
            </>
          )}
          {stage === "password" && (
            <>
              The new password is for <b className="text-ink">{name}</b>. Every
              other device is signed out.
            </>
          )}
        </p>
      </header>

      {stage === "find" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void start();
          }}
          className="grid gap-5"
        >
          <TextField
            id="handle"
            label="Username or email"
            icon={<User />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. mona_adel"
            autoComplete="username"
          />
          {error && <FormError>{error}</FormError>}
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Starting…" : "Continue"}
            {!isLoading && <ArrowRight />}
          </Button>
        </form>
      )}

      {stage === "prove" && method === "email" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleVerify();
          }}
          className="grid gap-5"
        >
          <div className="u-field">
            <span className="flex items-baseline justify-between gap-3">
              <label htmlFor="code">Code from the email</label>
              <Countdown secondsLeft={countdown} />
            </span>
            <input
              id="code"
              className="u-input u-input--code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          {error && <FormError>{error}</FormError>}
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Checking…" : "Continue"}
            {!isLoading && <ArrowRight />}
          </Button>
          <p className="t-sm t-muted">
            Nothing arrived?{" "}
            <button
              type="button"
              className="t-link"
              onClick={() => {
                setError(null);
                setStage("find");
              }}
            >
              Start again
            </button>
            {canUseCodeforces && (
              <>
                , or{" "}
                <button
                  type="button"
                  className="t-link"
                  disabled={isLoading}
                  onClick={() => void start("codeforces")}
                >
                  use your Codeforces profile instead
                </button>
              </>
            )}
            .
          </p>
        </form>
      )}

      {stage === "prove" && method === "codeforces" && (
        <div className="grid gap-5">
          <VerificationCode code={recoveryCode} secondsLeft={countdown} />
          {error && <FormError>{error}</FormError>}
          <Button size="lg" onClick={handleVerify} disabled={isLoading}>
            {isLoading ? "Checking your profile…" : "Verify profile"}
          </Button>
          <p className="t-sm t-muted">
            Keep this page open. You can put your first name back as soon as the
            handle is verified.
          </p>
        </div>
      )}

      {stage === "password" && (
        <form onSubmit={handleResetPassword} className="grid gap-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="solved">
              <Check />
              Account proven
            </Badge>
            <Countdown secondsLeft={countdown} />
          </div>
          <PasswordField
            id="newPassword"
            label="New password"
            icon={<Lock />}
            placeholder="8+ characters, with a number and a symbol"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          >
            <PasswordStrengthIndicator password={newPassword} />
          </PasswordField>
          <PasswordField
            id="confirmNewPassword"
            label="Confirm new password"
            icon={<Lock />}
            placeholder="Repeat your new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && <FormError>{error}</FormError>}
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Saving your password…" : "Reset password"}
          </Button>
        </form>
      )}
    </AuthStage>
  );
}

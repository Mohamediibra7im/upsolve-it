"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useToast } from "@/components/providers/Toast";
import { validatePassword } from "@/utils/passwordValidation";
import {
  AuthSplit,
  Countdown,
  FormError,
  HandleField,
  PasswordField,
  VerificationCode,
} from "@/components/features/auth";
import { resolveApiUrl } from "@/lib/apiClient";

const stages = ["enterHandle", "verify", "resetPassword"] as const;

const slab = {
  eyebrow: "How the reset works",
  statement: "Three steps and you are back in.",
  points: [
    "Find your account",
    "Show the handle is yours",
    "Choose a new password",
  ],
  note: "We never ask for your Codeforces password.",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stage, setStage] = useState<(typeof stages)[number]>("enterHandle");
  const [handle, setHandle] = useState("");
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
    if (stage === "enterHandle" || expiresAt === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setError("The time to verify expired. Start again to get a new code.");
        setVerificationToken("");
        setResetToken("");
        setRecoveryCode("");
        setStage("enterHandle");
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [stage, expiresAt]);

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) {
      setError("Enter your Codeforces handle.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/initiate-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handle.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        const deadline = new Date(data.expiresAt).getTime();
        if (
          !/^[a-f0-9]{32}$/.test(data.code) ||
          !data.verificationToken ||
          !Number.isFinite(deadline) ||
          deadline <= Date.now()
        )
          throw new Error("Recovery service unavailable");
        setVerificationToken(data.verificationToken);
        setRecoveryCode(data.code);
        setExpiresAt(deadline);
        setCountdown(Math.ceil((deadline - Date.now()) / 1000));
        setStage("verify");
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
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/verify-reset-profile"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationToken }),
      });

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
        setStage("resetPassword");
      } else {
        setError(
          data.message ||
            "We could not find the code on your profile. Save it on Codeforces, then verify again.",
        );
      }
    } catch (err) {
      console.error("Verify profile error:", err);
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
      const res = await fetch(resolveApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
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
        setStage("enterHandle");
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

  const currentStep = stages.indexOf(stage) + 1;

  return (
    <AuthSplit
      step={`Step ${currentStep} of 3`}
      title={
        {
          enterHandle: "Let’s get you back in.",
          verify: "Show the handle is yours.",
          resetPassword: "Choose a new password.",
        }[stage]
      }
      lead={
        {
          enterHandle:
            "Enter the Codeforces handle you signed up with. You will add a short code to your Codeforces profile to show it is yours.",
          verify: (
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
          ),
          resetPassword: (
            <>
              The new password is for <b className="text-ink">{handle}</b>. Once
              it is saved you log in with it.
            </>
          ),
        }[stage]
      }
      slab={{ ...slab, current: currentStep }}
    >
      {stage === "enterHandle" && (
        <form onSubmit={handleStartVerification} className="grid gap-5">
          <HandleField
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          {error && <FormError>{error}</FormError>}
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Starting…" : "Continue"}
          </Button>
          <p className="t-muted">
            Remembered your password?{" "}
            <Link href="/login" className="t-link">
              Log in
            </Link>
          </p>
        </form>
      )}
      {stage === "verify" && (
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
      {stage === "resetPassword" && (
        <form onSubmit={handleResetPassword} className="grid gap-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="solved">
              <Check />
              Handle verified
            </Badge>
            <Countdown secondsLeft={countdown} />
          </div>
          <PasswordField
            id="newPassword"
            label="New password"
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
    </AuthSplit>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { useToast } from "@/components/providers/Toast";
import {
  CheckCircle2,
  KeyRound,
  Clock,
  Shield,
  Eye,
  EyeOff,
  User,
  Lock,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { validatePassword } from "@/utils/passwordValidation";
import { AuthShell } from "@/components/features/auth";
import { m as motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { resolveApiUrl } from "@/lib/apiClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stage, setStage] = useState<
    "enterHandle" | "verify" | "resetPassword"
  >("enterHandle");
  const [handle, setHandle] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [countdown, setCountdown] = useState(120);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === "verify" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setError("Verification time expired. Please try again.");
      setStage("enterHandle");
    }
    return () => clearInterval(timer);
  }, [stage, countdown]);

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) {
      setError("Please enter your Codeforces handle.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/initiate-reset"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationToken(data.verificationToken);
        setStage("verify");
        setCountdown(120);
      } else {
        setError(data.message || "Failed to start verification.");
      }
    } catch (err) {
      console.error("Initiate reset error:", err);
      setError("Unable to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/verify-submission"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, verificationToken }),
      });

      const data = await res.json();
      if (res.ok) {
        setResetToken(data.resetToken);
        setStage("resetPassword");
      } else {
        setError(data.message || "Submission verification failed.");
      }
    } catch (err) {
      console.error("Verify submission error:", err);
      setError("Unable to connect. Please try verifying again.");
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
        body: JSON.stringify({ handle, resetToken, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
          variant: "success",
          durationMs: 4000,
        });

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Unable to reset your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const stageTitles = {
    enterHandle: "Find your account",
    verify: "Verify your account",
    resetPassword: "Choose a new password",
  };

  const currentStep = {
    enterHandle: 1,
    verify: 2,
    resetPassword: 3,
  }[stage];

  const inputClass =
    "h-12 rounded-xl border-[#343b37] bg-[#131715] pl-11 pr-11 text-sm text-[#f1f3ee] placeholder:text-[#68746c] focus-visible:ring-[#b5e3c4]/40 focus-visible:ring-offset-0";
  const buttonClass =
    "h-12 w-full rounded-xl bg-[#b5e3c4] text-sm font-semibold text-[#14241b] hover:bg-[#c7edd3]";
  const inputIconClass =
    "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#747e79]";
  const revealButtonClass =
    "absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#929b98] transition-colors hover:text-[#f1f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]";

  return (
    <AuthShell
      title="Let's get you back in."
      subtitle="Verify your Codeforces account and set a new password to continue your practice."
      icon={<ShieldCheck className="size-5" />}
      back={{ href: "/login", label: "Back to login" }}
    >
      <div className="space-y-7 text-[#f1f3ee]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-[#929b98]">Step {currentStep} of 3</p>
            <div className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={cn(
                    "h-1 w-7 rounded-full",
                    step <= currentStep ? "bg-[#b5e3c4]" : "bg-[#343b37]",
                  )}
                />
              ))}
            </div>
          </div>
          <h2 className="font-heading text-2xl font-medium tracking-[-0.04em]">
            {stageTitles[stage]}
          </h2>
        </div>
        <AnimatePresence mode="wait">
          {stage === "enterHandle" && (
            <motion.form
              key="enterHandle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleStartVerification}
              className="space-y-5"
            >
              <p className="text-[13px] leading-6 text-[#929b98]">
                Enter your Codeforces handle. We will ask you to make a specific
                submission to confirm the account belongs to you.
              </p>
              <div className="space-y-2">
                <label
                  htmlFor="handle"
                  className="text-[13px] font-medium text-[#c1cbc3]"
                >
                  Codeforces handle
                </label>
                <div className="relative">
                  <Input
                    id="handle"
                    type="text"
                    placeholder="e.g. tourist"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className={inputClass}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <User className={inputIconClass} />
                </div>
              </div>
              <Button
                type="submit"
                className={buttonClass}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Starting verification…
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </motion.form>
          )}
          {stage === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="rounded-2xl border border-[#d3b98b]/20 bg-[#d3b98b]/5 p-5">
                <div className="mb-3 flex items-center gap-2 text-[#d3b98b]">
                  <AlertTriangle size={17} />
                  <h3 className="text-sm font-medium">Confirm your account</h3>
                </div>
                <p className="text-[13px] leading-6 text-[#b6bdb9]">
                  Open{" "}
                  <a
                    href="https://codeforces.com/problemset/problem/4/A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#b5e3c4] underline underline-offset-4"
                  >
                    Problem 4A
                    <ExternalLink size={12} />
                  </a>{" "}
                  and submit code that results in a{" "}
                  <span className="font-medium text-[#f1f3ee]">
                    Compilation Error
                  </span>
                  .
                </p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#2b3031] bg-[#131715] px-4 py-3">
                <span className="flex items-center gap-2 text-xs text-[#929b98]">
                  <Clock size={14} />
                  Time remaining
                </span>
                <span className="text-2xl font-medium tabular-nums tracking-tight text-[#b5e3c4]">
                  {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <Button
                onClick={handleVerify}
                className={buttonClass}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Checking submission…
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    Verify submission
                  </>
                )}
              </Button>
            </motion.div>
          )}
          {stage === "resetPassword" && (
            <motion.form
              key="resetPassword"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              <div className="flex items-start gap-3 rounded-xl border border-[#b5e3c4]/15 bg-[#b5e3c4]/5 p-4">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-[#b5e3c4]"
                />
                <div>
                  <p className="text-sm font-medium text-[#b5e3c4]">
                    Account verified
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#929b98]">
                    Choose a new password for {handle}.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-[13px] font-medium text-[#c1cbc3]"
                >
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                  <Lock className={inputIconClass} />
                  <button
                    type="button"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={revealButtonClass}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrengthIndicator
                  password={newPassword}
                  className="pt-1"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="confirmNewPassword"
                  className="text-[13px] font-medium text-[#c1cbc3]"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                  <Lock className={inputIconClass} />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={revealButtonClass}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className={buttonClass}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Updating password…
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Reset password
                  </>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/5 p-4"
          >
            <p className="text-[13px] leading-5 text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 rounded-sm text-xs font-medium text-[#b6bdb9] hover:text-[#f1f3ee]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

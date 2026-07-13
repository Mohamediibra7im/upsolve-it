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
  Terminal,
  Activity,
  RefreshCw
} from "lucide-react";
import { validatePassword } from "@/utils/passwordValidation";
import { AuthShell } from "@/components/features/auth";
import { m as motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { resolveApiUrl } from "@/lib/apiClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stage, setStage] = useState<"enterHandle" | "verify" | "resetPassword">(
    "enterHandle"
  );
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
      setError("System connection error. Please try again later.");
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
      setError("Verification verification connection error.");
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
          durationMs: 4000
        });

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Final reset system error.");
    } finally {
      setIsLoading(false);
    }
  };

  const stageTitles = {
    enterHandle: "IDENTIFY_ACCOUNT",
    verify: "VERIFY_OWNERSHIP",
    resetPassword: "SET_NEW_PASSWORD",
  };

  const currentStep = {
    enterHandle: 1,
    verify: 2,
    resetPassword: 3,
  }[stage];

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Follow the steps below to verify your account and set a new password."
      icon={<ShieldCheck className="size-5 text-emerald-400" />}
      back={{ href: "/", label: "Back to Home" }}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="space-y-6 font-mono text-emerald-400">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
              <span>RECOVERY_STAGE</span>
              <span>{"//"}</span>
              <span>STEP_{currentStep}_OF_3</span>
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">
              {stageTitles[stage]}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => {
              const isActive = s === currentStep;
              const isCompleted = s < currentStep;

              return (
                <div
                  key={s}
                  className={cn(
                    "text-[9px] font-bold tracking-tighter px-1",
                    isActive
                      ? "text-emerald-300 font-extrabold"
                      : isCompleted
                      ? "text-emerald-500/30"
                      : "text-emerald-500/15"
                  )}
                >
                  {isCompleted ? "[✓]" : isActive ? "[█]" : "[░]"}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === "enterHandle" && (
            <motion.form 
              key="enterHandle"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleStartVerification} 
              className="space-y-5"
            >
              <div className="p-4 rounded-sm bg-emerald-950/5 border border-emerald-500/10 space-y-1 text-[9px] uppercase tracking-wide">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Terminal size={12} className="animate-pulse" />
                  <span>{"// VERIFICATION_LOGISTICS"}</span>
                </div>
                <p className="text-emerald-500/60 leading-relaxed">
                  Enter your Codeforces handle. You will need to make a specific submission to prove you own the account.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="handle"
                  className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50"
                >
                  [ USER_CF_HANDLE ]:
                </label>
                <div className="relative">
                  <Input
                    id="handle"
                    type="text"
                    placeholder="e.g. tourist"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className="form-input pl-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>STARTING_HANDSHAKE...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 justify-center">
                    <span>EXECUTE_INITIALIZE.EXE</span> <ArrowRight size={12} />
                  </div>
                )}
              </Button>
            </motion.form>
          )}

          {stage === "verify" && (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="space-y-5">
                <div className="p-5 rounded-sm bg-red-950/5 border border-red-500/20 space-y-3 text-center text-[10px] uppercase tracking-wide">
                  <div className="size-10 rounded-sm bg-red-950/10 flex items-center justify-center text-red-400 mx-auto border border-red-500/20 animate-pulse">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-red-400">ACTION REQUIRED // PROOF OF IDENTITY</h3>
                    <p className="text-[9px] text-emerald-500/60 leading-relaxed max-w-xs mx-auto">
                      Navigate to{" "}
                      <a 
                        href="https://codeforces.com/problemset/problem/4/A" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1 underline decoration-emerald-500/20"
                      >
                        PROBLEM 4A <ExternalLink size={10} />
                      </a>{" "}
                      and submit code that results in a <span className="text-red-400 font-bold">Compilation Error</span>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-sm border border-emerald-500/10 bg-emerald-950/5 text-center space-y-1 font-mono uppercase tracking-wider">
                  <div className="text-[8px] font-bold text-emerald-500/35 flex items-center justify-center gap-1.5">
                    <Clock size={10} /> TIME_REMAINING_FOR_SUBMISSION
                  </div>
                  <div className="text-3xl font-bold text-emerald-300 tabular-nums">
                    {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleVerify}
                className="w-full h-10 rounded-sm bg-emerald-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 hover:text-emerald-950 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>CHECKING_SUBMISSIONS...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 justify-center">
                    <span>EXECUTE_VERIFICATION.SYS</span> <Shield size={12} />
                  </div>
                )}
              </Button>
            </motion.div>
          )}

          {stage === "resetPassword" && (
            <motion.form 
              key="resetPassword"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleResetPassword} 
              className="space-y-5"
            >
              <div className="p-4 rounded-sm bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2 uppercase tracking-wide">
                <div className="size-10 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={16} />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-emerald-300">IDENTITY_CONFIRMED</h3>
                  <p className="text-[9px] text-emerald-500/60">
                    SETTING NEW PASSWORD FOR <span className="text-emerald-300 font-bold">{handle}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="newPassword" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
                    [ NEW_PASSWORD ]:
                  </label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="form-input pl-8 pr-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
                    />
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500/30 hover:text-emerald-300 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="px-1 pt-1">
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmNewPassword" className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
                    [ CONFIRM_NEW_PASSWORD ]:
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="form-input pl-8 pr-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
                    />
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500/30 hover:text-emerald-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>UPDATING_RECORD...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 justify-center">
                    <span>EXECUTE_PASSWORD_RESET.SYS</span> <KeyRound size={12} />
                  </div>
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-sm bg-red-950/10 border border-red-500/20 text-center space-y-2 uppercase tracking-wide"
          >
            <div className="flex items-center justify-center gap-1.5 text-red-400">
              <Activity size={12} />
              <span className="text-[8px] font-bold uppercase tracking-widest">Error Logged</span>
            </div>
            <p className="text-[10px] text-red-400/90 leading-relaxed">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[8px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 rounded-sm"
              onClick={() => setError(null)}
            >
              [ ACKNOWLEDGE_ERROR.EXE ]
            </Button>
          </motion.div>
        )}
      </div>
    </AuthShell>
  );
}
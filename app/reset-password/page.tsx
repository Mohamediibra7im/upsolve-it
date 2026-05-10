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
import AuthShell from "../login/_Components/AuthShell";
import { motion, AnimatePresence } from "framer-motion";
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
        setCountdown(120); // Reset countdown
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
        body: JSON.stringify({ verificationToken }),
      });

      const data = await res.json();
      if (res.ok) {
        setResetToken(data.resetToken);
        setStage("resetPassword");
      } else {
        setError(data.message || "Verification failed.");
      }
    } catch (err) {
      console.error("Verify submission error:", err);
      setError("Verification system error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setError("New password is required.");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(resolveApiUrl("/api/auth/reset-pin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
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
    enterHandle: "Identify Account",
    verify: "Verify Ownership",
    resetPassword: "Set New Password",
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
      icon={<ShieldCheck className="h-7 w-7" />}
      back={{ href: "/", label: "Back to Home" }}
      className="min-h-[calc(100vh-4rem)]"
    >
      <div className="space-y-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-6 px-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step {currentStep}</span>
              <div className="h-[1px] w-6 bg-primary/30" />
            </div>
            <p className="text-xl font-black text-foreground tracking-tight">
              {stageTitles[stage]}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => {
              const isActive = s === currentStep;
              const isCompleted = s < currentStep;

              let stepStateClass = "w-4 bg-white/10";
              if (isActive) {
                stepStateClass = "w-8 bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.4)]";
              } else if (isCompleted) {
                stepStateClass = "w-4 bg-emerald-500";
              }

              return (
                <div
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    stepStateClass
                  )}
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === "enterHandle" && (
            <motion.form 
              key="enterHandle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleStartVerification} 
              className="space-y-8"
            >
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Terminal size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verification Steps</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Enter your Codeforces handle. You will need to make a specific submission to prove you own the account.
                </p>
              </div>

              <div className="space-y-4">
                <label
                  htmlFor="handle"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1"
                >
                  Your Handle
                </label>
                <div className="relative group">
                  <Input
                    id="handle"
                    type="text"
                    placeholder="e.g. tourist"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    required
                    className="h-16 pl-12 bg-card/20 border-border/40 rounded-2xl text-lg focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Starting...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    Next Step <ArrowRight size={14} />
                  </div>
                )}
              </Button>
            </motion.form>
          )}

          {stage === "verify" && (
            <motion.div 
              key="verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 space-y-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto border border-amber-500/20">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Action Required</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
                      Navigate to <a href="https://codeforces.com/problemset/problem/4/A" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1">Problem 4A <ExternalLink size={12} /></a> and submit code that results in a <span className="text-destructive font-bold">Compilation Error</span>.
                    </p>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] border border-border/40 bg-card/20 backdrop-blur-xl text-center space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center justify-center gap-2">
                    <Clock size={12} /> Time Remaining
                  </div>
                  <div className="text-5xl font-black text-primary tracking-tighter tabular-nums">
                    {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleVerify}
                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-600 text-white shadow-2xl shadow-emerald-600/20 hover:-translate-y-1 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Checking Submissions...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    I've submitted: verify now <Shield size={14} />
                  </div>
                )}
              </Button>
            </motion.div>
          )}

          {stage === "resetPassword" && (
            <motion.form 
              key="resetPassword"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} 
              className="space-y-8"
            >
              <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/20">
                  <CheckCircle2 size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Identity Confirmed</h3>
                  <p className="text-sm text-muted-foreground font-medium">Setting new password for <span className="text-primary font-black">{handle}</span></p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="newPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">New Password</label>
                  <div className="relative group">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="h-16 pl-12 pr-12 bg-card/20 border-border/40 rounded-2xl text-lg focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="px-2">
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="confirmNewPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Confirm New Password</label>
                  <div className="relative group">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="h-16 pl-12 pr-12 bg-card/20 border-border/40 rounded-2xl text-lg focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    Reset Password <KeyRound size={14} />
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
            className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-center space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-destructive">
              <Activity size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Error</span>
            </div>
            <p className="text-sm text-destructive font-medium leading-relaxed">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-black uppercase tracking-widest hover:bg-destructive/5"
              onClick={() => setError(null)}
            >
              Acknowledge
            </Button>
          </motion.div>
        )}
      </div>
    </AuthShell>
  );
}








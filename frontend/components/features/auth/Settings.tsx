"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePassword } from "@/utils/passwordValidation";
import { useUser } from "@/hooks/auth";
import AuthShell from "./AuthShell";
import { User, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

type SettingsProps = {
  initialMode?: "login" | "signup";
};

const Settings = ({ initialMode = "login" }: SettingsProps) => {
  const router = useRouter();
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(() => initialMode !== "signup");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  const handleToggleForm = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!password) {
      setError("Password is required.");
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      if (!confirmPassword) {
        setError("Please confirm your password.");
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors.join(". "));
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = isLogin
        ? await login(codeforcesHandle, password)
        : await register(codeforcesHandle, password, confirmPassword);

      if (!response.success) {
        setError(response.error || "An unknown error occurred.");
      } else {
        router.replace("/dashboard");
      }
    } catch (_err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "h-12 rounded-xl border-[#343b37] bg-[#131715] pl-11 pr-11 text-sm text-[#f1f3ee] placeholder:text-[#68746c] focus-visible:ring-[#b5e3c4]/40 focus-visible:ring-offset-0";
  const inputIconClass =
    "pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#747e79]";
  const revealButtonClass =
    "absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#929b98] transition-colors hover:text-[#f1f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]";

  return (
    <AuthShell
      title={isLogin ? "Welcome back." : "Your next chapter starts here."}
      subtitle={
        isLogin
          ? "Pick up where you left off. Your next breakthrough is a little practice away."
          : "Turn your Codeforces progress into a clear path forward. Start your free account."
      }
      icon={<Shield className="size-5" />}
      footer={
        <div className="space-y-4 text-center text-xs leading-5 text-[#929b98]">
          <p>
            {isLogin ? "New to Upsolve.it? " : "Already have an account? "}
            <button
              onClick={handleToggleForm}
              className="rounded-sm font-medium text-[#b5e3c4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
          <p>
            Need a Codeforces account?{" "}
            <Link
              href="https://codeforces.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c1cbc3] underline decoration-[#454d48] underline-offset-4 hover:text-[#b5e3c4]"
            >
              Create one here
            </Link>
          </p>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-medium tracking-[-0.04em]">
            {isLogin ? "Log in to your account" : "Create your account"}
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-[#929b98]">
            Use your Codeforces handle to get started.
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="codeforcesHandle"
            className="text-[13px] font-medium text-[#c1cbc3]"
          >
            Codeforces handle
          </label>
          <div className="relative">
            <Input
              id="codeforcesHandle"
              type="text"
              value={codeforcesHandle}
              onChange={(e) => setCodeforcesHandle(e.target.value)}
              required
              placeholder="e.g. tourist"
              className={inputClass}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <User className={inputIconClass} />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="password"
              className="text-[13px] font-medium text-[#c1cbc3]"
            >
              Password
            </label>
            {isLogin && (
              <Link
                href="/reset-password"
                className="text-xs text-[#929b98] transition-colors hover:text-[#b5e3c4]"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={
                isLogin ? "Enter your password" : "Create a strong password"
              }
              autoComplete={isLogin ? "current-password" : "new-password"}
              className={inputClass}
            />
            <Lock className={inputIconClass} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={revealButtonClass}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {!isLogin && (
            <PasswordStrengthIndicator password={password} className="pt-1" />
          )}
        </div>
        {!isLogin && (
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-[13px] font-medium text-[#c1cbc3]"
            >
              Confirm password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className={inputClass}
              />
              <Lock className={inputIconClass} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={revealButtonClass}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-[13px] leading-5 text-red-300"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            className="rounded-xl border border-[#b5e3c4]/20 bg-[#b5e3c4]/5 p-3 text-[13px] leading-5 text-[#b5e3c4]"
          >
            {success}
          </div>
        )}
        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-[#b5e3c4] text-sm font-semibold text-[#14241b] hover:bg-[#c7edd3]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-[#14241b]/25 border-t-[#14241b]" />
              {isLogin ? "Logging in…" : "Creating account…"}
            </>
          ) : (
            <>
              {isLogin ? "Log in" : "Create free account"}
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Settings;

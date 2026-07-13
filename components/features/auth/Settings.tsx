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

  return (
    <AuthShell
      title={isLogin ? "Welcome Back" : "Create Account"}
      subtitle={
        isLogin
          ? "Sign in with your Codeforces handle and continue your training."
          : "Register with your Codeforces handle to start tracking your progress."
      }
      icon={<Shield className="size-5 text-emerald-400" />}
      className="w-full"
      footer={
        <div className="text-center space-y-4 font-mono">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-emerald-500/10" />
            </div>
            <div className="relative flex justify-center text-[7.5px] uppercase">
              <span className="bg-[#060a08]/90 px-2 text-emerald-500/30">
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleForm}
            className="text-[9.5px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
          >
            {isLogin
              ? "[ CREATE_NEW_IDENTITY.SYS ]"
              : "[ CONNECT_EXISTING_IDENTITY.SH ]"}
          </button>

          <div className="pt-3 border-t border-emerald-500/10 text-[9px] uppercase tracking-wide">
            <p className="text-emerald-500/40 mb-1.5">
              Don&apos;t have a Codeforces account?
            </p>
            <Link
              href="https://codeforces.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-bold"
            >
              [ REGISTER_ON_CODEFORCES ]
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 font-mono">
        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-1">
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              {isLogin ? "SIGN_IN.EXE" : "CREATE_ACCOUNT.SYS"}
            </p>
            <p className="text-[8px] text-emerald-500/40 uppercase tracking-wide">
              {isLogin ? "VALIDATE_NEURAL_LINK" : "INITIALIZE_IDENTITY_DATABASE"}
            </p>
          </div>
          <div className="rounded-sm border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[8.5px] font-bold text-emerald-400 uppercase tracking-widest">
            {isLogin ? "SECURE_CONN" : "NEW_RECORD"}
          </div>
        </div>

        {/* Codeforces Handle Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="codeforcesHandle"
            className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 flex items-center gap-1.5"
          >
            <User className="size-3 text-emerald-500/40" />
            [ USER_CF_HANDLE ]:
          </label>
          <div className="relative">
            <Input
              id="codeforcesHandle"
              type="text"
              value={codeforcesHandle}
              onChange={(e) => setCodeforcesHandle(e.target.value)}
              required
              placeholder="e.g. tourist"
              className="form-input pl-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
            <label
              htmlFor="password"
              className="text-emerald-500/50 flex items-center gap-1.5"
            >
              <Lock className="size-3 text-emerald-500/40" />
              [ SECURITY_PASSWORD ]:
            </label>
            {isLogin ? (
              <Link
                href="/reset-password"
                className="text-emerald-500/45 hover:text-emerald-300 transition-colors"
              >
                [ RESET_PASSWORD.SYS ]
              </Link>
            ) : null}
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isLogin ? "Enter password" : "Create password"}
              className="form-input pl-8 pr-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
            />
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500/30 hover:text-emerald-300 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
          {!isLogin ? <PasswordStrengthIndicator password={password} /> : null}
        </div>

        {/* Confirm Password for Registration */}
        {!isLogin ? (
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/50 flex items-center gap-1.5"
            >
              <Lock className="size-3 text-emerald-500/40" />
              [ CONFIRM_SECURITY_PASSWORD ]:
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="form-input pl-8 pr-8 h-9 border border-emerald-500/20 bg-[#040604] text-emerald-300 placeholder-emerald-500/20 rounded-sm text-xs focus:border-emerald-500/50 outline-none transition-all"
              />
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-500/30" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500/30 hover:text-emerald-300 transition-colors"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* Error and Success Messages */}
        {error ? (
          <div className="p-2.5 rounded-sm bg-red-950/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="p-2.5 rounded-sm bg-emerald-950/10 border border-emerald-500/20 text-emerald-400 text-[9px] uppercase tracking-wide text-center">
            {success}
          </div>
        ) : null}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="size-3 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
              <span>{isLogin ? "VALIDATING..." : "CREATING..."}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              <span>{isLogin ? "EXECUTE_SIGN_IN.EXE" : "EXECUTE_REGISTRATION.SH"}</span>
              <ArrowRight className="size-3.5" />
            </div>
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Settings;

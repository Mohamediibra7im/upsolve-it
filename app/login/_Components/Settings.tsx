"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePassword } from "@/utils/passwordValidation";
import useUser from "@/hooks/useUser";
import AuthShell from "./AuthShell";
import { User, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield } from "lucide-react";

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
        // Successful login/register → go home immediately
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
      title={isLogin ? "Welcome back" : "Create your account"}
      subtitle={
        isLogin
          ? "Sign in with your Codeforces handle and continue your training."
          : "Register with your Codeforces handle to start tracking your progress."
      }
      icon={<Shield className="h-7 w-7" />}
      className="w-full"
      footer={
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/50 px-2 text-muted-foreground backdrop-blur">
                or
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleForm}
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            {isLogin
              ? "Don’t have an account? Create one"
              : "Already have an account? Sign in"}
          </button>

          <div className="pt-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground mb-2">
              Don&apos;t have a Codeforces account?
            </p>
            <Link
              href="https://codeforces.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1 font-medium"
            >
              Create one on Codeforces
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">
              {isLogin ? "Sign in" : "Register"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Welcome back to Upsolve.it." : "It takes less than a minute."}
            </p>
          </div>
          <div className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
            {isLogin ? "Login" : "Register"}
          </div>
        </div>

        {/* Codeforces Handle Input */}
        <div className="space-y-2">
          <label
            htmlFor="codeforcesHandle"
            className="text-sm font-medium flex items-center gap-2"
          >
            <User className="h-4 w-4 text-primary" />
            Codeforces Handle
          </label>
          <div className="relative">
            <Input
              id="codeforcesHandle"
              type="text"
              value={codeforcesHandle}
              onChange={(e) => setCodeforcesHandle(e.target.value)}
              required
              placeholder="e.g. tourist"
              className="form-input pl-10 h-12 border-2 bg-background/60 backdrop-blur focus:border-primary/50"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Your username from{" "}
            <Link
              href="https://codeforces.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              codeforces.com
            </Link>
          </p>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="password"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-primary" />
              Password
            </label>
            {isLogin ? (
              <Link
                href="/reset-password"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                Forgot password
                <ArrowRight className="h-3 w-3" />
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
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
              className="form-input pl-10 pr-10 h-12 border-2 bg-background/60 backdrop-blur focus:border-primary/50"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {!isLogin ? <PasswordStrengthIndicator password={password} /> : null}
        </div>

        {/* Confirm Password for Registration */}
        {!isLogin ? (
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-primary" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="form-input pl-10 pr-10 h-12 border-2 bg-background/60 backdrop-blur focus:border-primary/50"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={
                  showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ) : null}

        {/* Error and Success Messages */}
        {error ? (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        ) : null}
        {success ? (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-600 text-center">{success}</p>
          </div>
        ) : null}

        {/* Submit Button */}
        <Button
          type="submit"
          className="btn-enhanced w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              {isLogin ? "Signing in..." : "Creating account..."}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </div>
          )}
        </Button>
      </form>
    </AuthShell>
  );
};

export default Settings;








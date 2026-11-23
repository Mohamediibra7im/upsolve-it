"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { validatePassword } from "@/utils/passwordValidation";
import { useUser } from "@/hooks/auth";
import {
  AuthSplit,
  FormError,
  HandleField,
  PasswordField,
  type Slab,
} from "./AuthFrame";

const slabs: Record<"login" | "signup", Slab> = {
  login: {
    eyebrow: "Competitive programming practice, with a plan",
    statement: "A little more practice. A better problem solver.",
    points: [
      "Find your next challenge",
      "Build a consistent practice",
      "See how far you have come",
    ],
  },
  signup: {
    eyebrow: "What happens next",
    statement: "Three steps to your first session.",
    points: [
      "Create your account",
      "Verify your handle",
      "Start your first session",
    ],
    current: 1,
  },
};

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (!isLogin) {
      if (!confirmPassword) {
        setError("Enter your password again to confirm it.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.errors.join(". "));
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = isLogin
        ? await login(codeforcesHandle, password)
        : await register(codeforcesHandle, password, confirmPassword);

      if (response.success) router.replace("/dashboard");
      else setError(response.error || "Something went wrong. Try again.");
    } catch {
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplit
      title={isLogin ? "Welcome back." : "Create your account."}
      lead={
        isLogin
          ? "Log in with the Codeforces handle you signed up with."
          : "Sign up with your Codeforces handle. We read your rating from it and never ask for your Codeforces password."
      }
      slab={slabs[mode]}
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <HandleField
          value={codeforcesHandle}
          onChange={(e) => setCodeforcesHandle(e.target.value)}
        />
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            isLogin
              ? "Your password"
              : "8+ characters, with a number and a symbol"
          }
          autoComplete={isLogin ? "current-password" : "new-password"}
          action={
            isLogin && (
              <Link href="/reset-password" className="t-link font-medium">
                Forgot password?
              </Link>
            )
          }
        >
          {!isLogin && <PasswordStrengthIndicator password={password} />}
        </PasswordField>
        {!isLogin && (
          <PasswordField
            id="confirmPassword"
            label="Confirm password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        )}
        {error && <FormError>{error}</FormError>}
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLogin
            ? isLoading
              ? "Logging in…"
              : "Log in"
            : isLoading
              ? "Creating your account…"
              : "Create account"}
        </Button>
        <p className="t-muted">
          {isLogin ? "New to Upsolve It? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"} className="t-link">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </form>
    </AuthSplit>
  );
}

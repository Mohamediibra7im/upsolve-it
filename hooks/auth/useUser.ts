import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { User } from "@/types/User";
import { Response, SuccessResponse, ErrorResponse } from "@/types/Response";
import { setRefreshCallback, clearRefreshCallback, setLogoutCallback, clearLogoutCallback, resolveApiUrl } from "@/lib/apiClient";

const USER_CACHE_KEY = "codeforces-user";

const useUser = () => {
  const [isReady, setIsReady] = useState(false);

  const {
    data: user,
    mutate,
    error,
  } = useSWR<User | null>(
    USER_CACHE_KEY,
    null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Single effect: read localStorage + register callbacks.
  // React 18 batches mutate() + setIsReady() into one re-render, so
  // this is 2 renders total (down from 3 in the original approach).
  useEffect(() => {
    let parsed: User | null = null;
    try {
      const stored = localStorage.getItem("user");
      parsed = stored ? (JSON.parse(stored) as User) : null;
    } catch {
      localStorage.removeItem("user");
    }
    mutate(parsed, false);
    setIsReady(true);

    setRefreshCallback((updatedUser: User) => {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      mutate(updatedUser, false);
    });
    setLogoutCallback(() => {
      mutate(null, false);
    });

    return () => {
      clearRefreshCallback();
      clearLogoutCallback();
    };
  }, [mutate]);

  const login = useCallback(
    async (codeforcesHandle: string, password: string): Promise<Response<User>> => {
      try {
        const res = await fetch(resolveApiUrl("/api/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codeforcesHandle, password }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          return ErrorResponse(data.message);
        }
        localStorage.setItem("user", JSON.stringify(data.user));
        await mutate(data.user, false);
        return SuccessResponse(data.user);
      } catch (error) {
        console.error("Login failed:", error);
        return ErrorResponse("Failed to connect to the server.");
      }
    },
    [mutate],
  );

  const register = useCallback(
    async (codeforcesHandle: string, password: string, confirmPassword: string): Promise<Response<User>> => {
      try {
        const res = await fetch(resolveApiUrl("/api/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codeforcesHandle, password, confirmPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          return ErrorResponse(data.message);
        }
        return await login(codeforcesHandle, password);
      } catch (error) {
        console.error("Registration failed:", error);
        return ErrorResponse("Failed to connect to the server.");
      }
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await fetch(resolveApiUrl("/api/auth/logout"), {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    localStorage.removeItem("user");
    mutate(null, false);
  }, [mutate]);

  const resetPassword = useCallback(async (
    oldPassword: string,
    newPassword: string,
  ): Promise<Response<null>> => {
    try {
      const res = await fetch(resolveApiUrl("/api/auth/reset-pin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }
      return SuccessResponse(null);
    } catch (error) {
      console.error("Password reset failed:", error);
      return ErrorResponse("Failed to connect to the server.");
    }
  }, []);

  const syncProfile = useCallback(async (): Promise<Response<User>> => {
    try {
      const res = await fetch(resolveApiUrl("/api/auth/sync-profile"), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        await mutate(data.user, false);
      }
      return SuccessResponse(data.user);
    } catch (error) {
      console.error("Profile sync failed:", error);
      return ErrorResponse("Failed to sync profile");
    }
  }, [mutate]);

  const generateVerificationCode = useCallback(async (): Promise<Response<{ code: string; expiresAt: number }>> => {
    try {
      const res = await fetch(resolveApiUrl("/api/auth/generate-verification-code"), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }
      return SuccessResponse({ code: data.code, expiresAt: data.expiresAt });
    } catch (error) {
      console.error("Generate verification code failed:", error);
      return ErrorResponse("Failed to generate verification code");
    }
  }, []);

  const verifyCodeforcesProfile = useCallback(async (): Promise<Response<{ xpEarned: number }>> => {
    try {
      const res = await fetch(resolveApiUrl("/api/auth/verify-codeforces-profile"), {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        return ErrorResponse(data.message);
      }
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      await mutate((current) => current ? { ...current, isVerified: true } : current, false);
      return SuccessResponse({ xpEarned: data.xpEarned ?? 50 });
    } catch (error) {
      console.error("Verify Codeforces profile failed:", error);
      return ErrorResponse("Failed to verify profile");
    }
  }, [mutate, user]);

  return {
    user: user ?? null,
    isLoading: !isReady,
    error,
    register,
    login,
    logout,
    resetPassword,
    syncProfile,
    generateVerificationCode,
    verifyCodeforcesProfile,
  };
};

export default useUser;

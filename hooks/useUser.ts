import { useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import { User } from "@/types/User";
import { Response, SuccessResponse, ErrorResponse } from "@/types/Response";
import { setRefreshCallback, clearRefreshCallback, setLogoutCallback, clearLogoutCallback, resolveApiUrl } from "@/lib/apiClient";

const USER_CACHE_KEY = "codeforces-user";

const useUser = () => {
  const [isClient, setIsClient] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize user from localStorage
  useEffect(() => {
    if (!isClient) return;

    const initializeSession = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            await mutate(parsedUser, false);
          } catch (e) {
            console.error("Failed to parse stored user:", e);
            localStorage.removeItem("user");
            await mutate(null, false);
          }
        } else {
          await mutate(null, false);
        }
      } finally {
        // Ensure we mark initialization as complete regardless of outcome
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [isClient, mutate]);

  // Register refresh and logout callbacks
  useEffect(() => {
    if (!isClient) return;

    const handleRefresh = (updatedUser: User) => {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      mutate(updatedUser, false);
    };

    const handleLogout = () => {
      mutate(null, false);
    };

    setRefreshCallback(handleRefresh);
    setLogoutCallback(handleLogout);

    return () => {
      clearRefreshCallback();
      clearLogoutCallback();
    };
  }, [isClient, mutate]);

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

        if (isClient) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        await mutate(data.user, false);
        return SuccessResponse(data.user);
      } catch (error) {
        console.error("Login failed:", error);
        return ErrorResponse("Failed to connect to the server.");
      }
    },
    [isClient, mutate],
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

    if (isClient) {
      localStorage.removeItem("user");
    }
    mutate(null, false);
  }, [isClient, mutate]);

  const resetPassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<Response<null>> => {
    try {
      const res = await fetch(resolveApiUrl("/api/auth/reset-pin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  };

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

      if (isClient && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        await mutate(data.user, false);
      }

      return SuccessResponse(data.user);
    } catch (error) {
      console.error("Profile sync failed:", error);
      return ErrorResponse("Failed to sync profile");
    }
  }, [isClient, mutate]);

  return {
    user,
    isLoading: isInitializing || !isClient,
    error,
    register,
    login,
    logout,
    resetPassword,
    syncProfile,
  };
};

export default useUser;

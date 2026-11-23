import useSWR from "swr";
import { apiFetcher } from "@/lib/apiClient";
import { User } from "@/types/User";

interface AdminUsersResponse {
  users: User[];
  total: number;
}

const fetcher = (url: string) => apiFetcher<AdminUsersResponse>(url);

const EMPTY_USERS: User[] = [];

export function useAdminUsers() {
  // Request all users (backend caps at 5000); the table paginates client-side.
  const { data, error, mutate } = useSWR<AdminUsersResponse>("/api/admin/users?limit=0", fetcher, {
    // Optimize for fast loading
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60000, // 1 minute
    refreshInterval: 300000, // 5 minutes
    refreshWhenHidden: false,
  });

  return {
    users: data?.users || EMPTY_USERS,
    totalUsers: data?.total ?? data?.users?.length ?? 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  return apiFetcher("/api/admin/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, role }),
  });
}

export async function syncUserRating(userId: string) {
  return apiFetcher<{ user: User }>(`/api/admin/users/${userId}/sync`, {
    method: "POST",
  });
}

export async function syncBatchUserRatings(userIds: string[]) {
  return apiFetcher<{ synced: number; failed: number }>(`/api/admin/users/sync-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userIds }),
  });
}





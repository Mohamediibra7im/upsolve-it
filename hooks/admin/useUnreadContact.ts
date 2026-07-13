import useSWR from "swr";
import { apiFetcher } from "@/lib/apiClient";

export interface UnreadContactItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  createdAt: string;
}

export interface UnreadContactSummary {
  count: number;
  items: UnreadContactItem[];
}

/**
 * Real data behind the admin header notification bell: unread support messages.
 * Polls every 60s so a newly-arrived message surfaces without a manual refresh.
 */
export function useUnreadContact() {
  const { data, error, mutate, isLoading } = useSWR<UnreadContactSummary>(
    "/api/admin/contact/unread",
    apiFetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60_000,
      refreshWhenHidden: false,
    },
  );

  return {
    count: data?.count ?? 0,
    items: data?.items ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

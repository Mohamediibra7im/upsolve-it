import { apiFetcher, apiClient } from "@/lib/apiClient";
import useSWR from "swr";

export interface WhatsNewEntry {
  _id: string;
  title: string;
  content: string;
  version: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => apiFetcher<WhatsNewEntry[]>(url);

/** Fetch only published entries (user-facing). */
export function useWhatsNewPublished() {
  const { data, error, mutate } = useSWR<WhatsNewEntry[]>(
    "/api/whats-new",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  return {
    entries: data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

/** Fetch all entries including drafts (admin-facing). */
export function useWhatsNewAdmin() {
  const { data, error, mutate } = useSWR<WhatsNewEntry[]>(
    "/api/whats-new/admin",
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    },
  );

  return {
    entries: data ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createWhatsNewEntry(data: {
  title: string;
  content: string;
  version?: string;
  isPublished?: boolean;
}) {
  return apiClient.post<WhatsNewEntry>("/api/whats-new/admin", data);
}

export async function updateWhatsNewEntry(
  id: string,
  data: {
    title?: string;
    content?: string;
    version?: string;
    isPublished?: boolean;
  },
) {
  return apiClient.patch<WhatsNewEntry>(`/api/whats-new/admin/${id}`, data);
}

export async function deleteWhatsNewEntry(id: string) {
  return apiClient.delete(`/api/whats-new/admin/${id}`);
}

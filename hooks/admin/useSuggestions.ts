import { apiFetcher, apiClient } from "@/lib/apiClient";
import useSWR from "swr";

export interface Suggestion {
  _id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const fetcher = (url: string) => apiFetcher<Suggestion[]>(url);

/** Fetch active suggestions (user-facing). */
export function useSuggestions() {
  const { data, error, mutate } = useSWR<Suggestion[]>(
    "/api/suggestions",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );
  return { suggestions: data ?? [], isLoading: !error && !data, isError: error, mutate };
}

/** Fetch all suggestions including inactive (admin-facing). */
export function useSuggestionsAdmin() {
  const { data, error, mutate } = useSWR<Suggestion[]>(
    "/api/suggestions/admin",
    fetcher,
    { revalidateOnFocus: true, dedupingInterval: 10000 },
  );
  return { suggestions: data ?? [], isLoading: !error && !data, isError: error, mutate };
}

export async function createSuggestion(data: {
  title: string;
  description: string;
  url: string;
  category?: string;
  isActive?: boolean;
  order?: number;
}) {
  return apiClient.post<Suggestion>("/api/suggestions/admin", data);
}

export async function updateSuggestion(id: string, data: {
  title?: string;
  description?: string;
  url?: string;
  category?: string;
  isActive?: boolean;
  order?: number;
}) {
  return apiClient.patch<Suggestion>(`/api/suggestions/admin/${id}`, data);
}

export async function deleteSuggestion(id: string) {
  return apiClient.delete(`/api/suggestions/admin/${id}`);
}

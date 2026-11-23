import useSWR, { mutate as mutateSwr } from "swr";
import { apiClient, apiFetcher } from "@/lib/apiClient";
import type { Announcement, AnnouncementInput } from "@/types/Announcement";

interface AdminAnnouncementsResponse {
  announcements: Announcement[];
  total: number;
  limit: number;
  offset: number;
}

const BASE = "/api/admin/announcements";

export function useAdminAnnouncements(limit: number, offset: number) {
  const { data, error, isLoading, mutate } = useSWR<AdminAnnouncementsResponse>(
    `${BASE}?limit=${limit}&offset=${offset}`,
    apiFetcher,
  );

  return {
    announcements: data?.announcements ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError: error,
    mutate,
  };
}

/** The pop-up asks again, so the admin sees the change without a reload. */
const refreshPopUp = () =>
  mutateSwr(
    (key) =>
      typeof key === "string" && key.startsWith("/api/announcements/current"),
  );

/** Creates, or with an id replaces every field of that announcement. */
export async function saveAnnouncement(input: AnnouncementInput, id?: string) {
  await (id
    ? apiClient.put(`${BASE}/${id}`, input)
    : apiClient.post(BASE, input));
  await refreshPopUp();
}

export async function deleteAnnouncement(id: string) {
  await apiClient.delete(`${BASE}/${id}`);
  await refreshPopUp();
}

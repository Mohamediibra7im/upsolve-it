import useSWR from "swr";
import { apiClient, apiFetcher } from "@/lib/apiClient";
import type { Room } from "@/types/Room";

/**
 * A room, re-read every few seconds: that is how everyone in it sees who
 * joined, when it starts and who has solved what.
 * ponytail: polling. Move to a push channel if rooms grow past a handful of
 * people or need sub-second updates.
 */
export function useRoom(code: string | null | undefined, everyMs = 4000) {
  const { data, error, isLoading, mutate } = useSWR<Room>(
    code ? `/api/rooms/${code}` : null,
    apiFetcher,
    { refreshInterval: everyMs, dedupingInterval: 1000 },
  );
  const act = async (verb: "join" | "start") => {
    const next = await apiClient.post<Room>(`/api/rooms/${code}/${verb}`, {});
    await mutate(next, { revalidate: false });
    return next;
  };
  return {
    room: data,
    error: error as Error | undefined,
    isLoading,
    join: () => act("join"),
    start: () => act("start"),
    leave: () => apiClient.post(`/api/rooms/${code}/leave`, {}),
  };
}

/** Tells the room what this person has solved and tried. Never throws. */
export const reportRoomProgress = (
  code: string,
  solved: string[],
  tried: string[],
) =>
  apiClient
    .post(`/api/rooms/${code}/progress`, { solved, tried })
    .catch(() => undefined);

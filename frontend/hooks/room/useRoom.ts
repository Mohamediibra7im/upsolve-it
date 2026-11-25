import useSWR from "swr";
import { apiClient, apiFetcher } from "@/lib/apiClient";
import type { Room } from "@/types/Room";

// The room's times are the server's; knowing when an answer arrived is what
// lets a countdown run between two reads.
const stamped = (room: Room): Room => ({ ...room, receivedAt: Date.now() });

/**
 * A room, re-read every few seconds: that is how everyone in it sees who
 * joined, when it starts and who has solved what. While a vote to end is
 * running it is read faster, so the count moves as people answer.
 * ponytail: polling. Move to a push channel if rooms grow past a handful of
 * people or need sub-second updates.
 */
export function useRoom(code: string | null | undefined, everyMs = 4000) {
  const { data, error, isLoading, mutate } = useSWR<Room>(
    code ? `/api/rooms/${code}` : null,
    (url: string) => apiFetcher<Room>(url).then(stamped),
    {
      refreshInterval: (room) => (room?.endVote ? 1500 : everyMs),
      dedupingInterval: 1000,
    },
  );
  const act = async (verb: "join" | "start" | "end-vote", body = {}) => {
    const next = stamped(
      await apiClient.post<Room>(`/api/rooms/${code}/${verb}`, body),
    );
    await mutate(next, { revalidate: false });
    return next;
  };
  return {
    room: data,
    error: error as Error | undefined,
    isLoading,
    /** Reads the room again now. */
    refresh: () => mutate(),
    join: () => act("join"),
    start: () => act("start"),
    /** Agree to end the room (calling the vote if none is running), or keep going. */
    vote: (agree: boolean) => act("end-vote", { agree }),
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

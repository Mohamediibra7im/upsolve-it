import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import type { FriendRequestsResponse } from "@/types/Friend";

/**
 * @param enabled Pass false when logged out so we never hit `/api/friends/requests` (401).
 */
export function useFriendRequests(enabled = true) {
  const { data, error, isLoading: _isLoading, mutate } = useSWR<FriendRequestsResponse>(
    enabled ? "/api/friends/requests" : null,
    swrFetcher,
    { revalidateOnFocus: true },
  );

  return {
    incoming: data?.incoming ?? [],
    outgoing: data?.outgoing ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

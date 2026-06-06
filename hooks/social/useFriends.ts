import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import type { FriendsListResponse } from "@/types/Friend";

export function useFriends(enabled = true) {
  const { data, error, isLoading: _isLoading, mutate } = useSWR<FriendsListResponse>(
    enabled ? "/api/friends" : null,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

  return {
    friends: data?.friends ?? [],
    isLoading: enabled ? (!error && !data) : false,
    isError: error,
    mutate,
  };
}

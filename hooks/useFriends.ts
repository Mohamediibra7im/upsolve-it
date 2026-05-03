import useSWR from "swr";
import { swrFetcher } from "@/lib/apiClient";
import type { FriendsListResponse } from "@/types/Friend";

export function useFriends() {
  const { data, error, isLoading, mutate } = useSWR<FriendsListResponse>(
    "/api/friends",
    swrFetcher,
    { revalidateOnFocus: true },
  );

  return {
    friends: data?.friends ?? [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

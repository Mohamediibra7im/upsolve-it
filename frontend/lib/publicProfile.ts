import type { PublicProfile } from "@/components/features/profile/PublicProfileView";
import { resolveApiUrl } from "./apiClient";

/** The public profile for a handle, or null when it is unknown or not public. */
export async function fetchPublicProfile(
  handle: string,
): Promise<PublicProfile | null> {
  // Same shape the API accepts; also keeps the handle safe to put in a URL.
  if (!/^[a-zA-Z0-9._]{3,24}$/.test(handle)) return null;
  const path = `/api/public-profile/${handle}`;
  const internal = process.env.API_INTERNAL_URL;
  const res = await fetch(
    internal ? `${internal}${path}` : resolveApiUrl(path),
    { next: { revalidate: 60 } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Public profile request failed (${res.status})`);
  return res.json();
}

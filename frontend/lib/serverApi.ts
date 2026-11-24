import { resolveApiUrl } from "./apiClient";

/**
 * A request the web server makes to the API itself, for a page it renders or
 * a share image it draws. In production the API is private and
 * API_INTERNAL_URL is where it lives (set at run time in fly.toml); in
 * development the public base address is used.
 *
 * It gives up after eight seconds, so a page shows its "did not load" state
 * instead of keeping the visitor on a skeleton.
 */
export function serverApiFetch(path: string, revalidate: number) {
  const internal = process.env.API_INTERNAL_URL;
  return fetch(internal ? `${internal}${path}` : resolveApiUrl(path), {
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
}

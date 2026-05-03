/** Same rules as backend: typical Codeforces handle format. */
const CF_HANDLE_PATTERN = /^[a-zA-Z0-9._]{3,24}$/;

export function normalizeCodeforcesHandleInput(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("@")) {
    s = s.slice(1).trim();
  }
  const profileMatch = s.match(/codeforces\.com\/profile\/([^/?#\s]+)/i);
  if (profileMatch) {
    try {
      s = decodeURIComponent(profileMatch[1]);
    } catch {
      s = profileMatch[1];
    }
  }
  return s.trim();
}

export function isValidCodeforcesHandleFormat(handle: string): boolean {
  return CF_HANDLE_PATTERN.test(handle);
}

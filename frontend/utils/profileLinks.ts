import type { ProfileLinks } from "@/types/User";

export type LinkKey = keyof ProfileLinks;

/** A pasted profile URL of one platform; captures the username. */
const profileUrl = (host: string, path = "") =>
  new RegExp(
    `^(?:https?://)?(?:[a-z0-9-]+\\.)?${host}/${path}@?([^/?#\\s]+)`,
    "i",
  );

// The username rules repeat the API's (backend/src/modules/auth/dto/update-profile.dto.ts),
// which is the one that decides. `website` has no base: it is the URL itself.
export const PLATFORMS: ReadonlyArray<{
  key: LinkKey;
  label: string;
  placeholder: string;
  base?: string;
  url?: RegExp;
  username?: RegExp;
  allowed?: string;
}> = [
  {
    key: "github",
    label: "GitHub",
    placeholder: "octocat",
    base: "https://github.com/",
    url: profileUrl("github\\.com"),
    username: /^[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38}$/,
    allowed: "letters, digits and single hyphens",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    placeholder: "your-name-1a2b3c",
    base: "https://www.linkedin.com/in/",
    url: profileUrl("linkedin\\.com", "in/"),
    username: /^[A-Za-z0-9-]{3,100}$/,
    allowed: "letters, digits and hyphens",
  },
  {
    key: "x",
    label: "X",
    placeholder: "username",
    base: "https://x.com/",
    url: profileUrl("(?:x|twitter)\\.com"),
    username: /^[A-Za-z0-9_]{1,15}$/,
    allowed: "letters, digits and underscores, up to 15",
  },
  {
    key: "website",
    label: "Website",
    placeholder: "https://your-site.com",
  },
  {
    key: "atcoder",
    label: "AtCoder",
    placeholder: "username",
    base: "https://atcoder.jp/users/",
    url: profileUrl("atcoder\\.jp", "users/"),
    username: /^[A-Za-z0-9_]{3,16}$/,
    allowed: "letters, digits and underscores, 3 to 16",
  },
  {
    key: "leetcode",
    label: "LeetCode",
    placeholder: "username",
    base: "https://leetcode.com/u/",
    url: profileUrl("leetcode\\.com", "(?:u/)?"),
    username: /^[A-Za-z0-9_-]{1,40}$/,
    allowed: "letters, digits, hyphens and underscores",
  },
  {
    key: "codechef",
    label: "CodeChef",
    placeholder: "username",
    base: "https://www.codechef.com/users/",
    url: profileUrl("codechef\\.com", "users/"),
    username: /^[A-Za-z0-9_]{3,20}$/,
    allowed: "letters, digits and underscores, 3 to 20",
  },
];

const platform = (key: LinkKey) => PLATFORMS.find((p) => p.key === key)!;

function isHttpsUrl(value: string) {
  if (value.length > 200 || !/^https:\/\/[^\s<>"'`\\]+$/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

/**
 * What to keep from what someone typed or pasted into a link field: the
 * username out of a profile URL of that platform, a leading @ dropped, and
 * https:// put in front of a bare website address. Anything else is returned
 * trimmed, for linkError to judge.
 */
export function normalizeLink(key: LinkKey, raw: string): string {
  const value = raw.trim();
  const { url } = platform(key);
  if (!url) {
    return value && !/^[a-z][a-z0-9+.-]*:/i.test(value)
      ? `https://${value}`
      : value;
  }
  return (url.exec(value)?.[1] ?? value).replace(/^@/, "");
}

/** Why a normalized value cannot be saved, in words for the person typing; null when it can. */
export function linkError(key: LinkKey, value: string): string | null {
  if (!value) return null;
  const { label, username, allowed } = platform(key);
  if (!username) {
    return isHttpsUrl(value)
      ? null
      : "Enter a full address that starts with https://, like https://your-site.com.";
  }
  return username.test(value)
    ? null
    : `Enter your ${label} username (${allowed}) or paste your ${label} profile link.`;
}

/** The filled-in links, ready to render. Hrefs are built here and nowhere else. */
export function profileLinkList(links?: Partial<ProfileLinks> | null) {
  return PLATFORMS.flatMap(({ key, label, base }) => {
    const value = links?.[key];
    // A value the rules would not accept is never turned into a link.
    if (!value || linkError(key, value)) return [];
    return [
      {
        key,
        label,
        username: base ? value : value.replace(/^https:\/\/|\/$/g, ""),
        href: base ? base + value : value,
      },
    ];
  });
}

/** Only public, immutable Codeforces image paths may use our image cache. */
export function codeforcesImageUrl(value: string): string | null {
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (!['http:', 'https:'].includes(url.protocol) || url.hostname !== 'userpic.codeforces.org' || url.username || url.password || url.port || url.search || url.hash) return null;
    if (!/^\/(?:\d+\/(?:avatar|title)\/[a-zA-Z0-9_-]+\.(?:jpe?g|png|gif|webp)|(?:no-avatar|no-title)\.jpg)$/.test(url.pathname)) return null;
    url.protocol = 'https:';
    return url.href;
  } catch { return null; }
}

export function profileImageSrc(value?: string): string | undefined {
  if (!value) return undefined;
  const trusted = codeforcesImageUrl(value);
  return trusted ? `/api/profile-image?url=${encodeURIComponent(trusted)}` : value;
}

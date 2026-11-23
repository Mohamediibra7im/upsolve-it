// The server has the last word (backend/src/modules/announcements/dto):
// these repeat its caps and its link rule for the editor and the pop-up.

export const TITLE_MAX = 80;
export const MESSAGE_MAX = 600;
export const ACTION_LABEL_MAX = 30;

/**
 * An internal path ("/training") or a full https:// address, and nothing else:
 * no javascript:, data: or http:, and no "//host" or "/\host", which a browser
 * reads as another site.
 */
export function isActionUrl(url: string): boolean {
  if (url.length > 300 || /[\s\\<>"'`]/.test(url)) return false;
  if (url.startsWith("/")) return !url.startsWith("//");
  if (!url.startsWith("https://")) return false;
  try {
    const parsed = new URL(url);
    return (
      !parsed.username && !parsed.password && parsed.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

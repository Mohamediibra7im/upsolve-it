import { RANK_HEX, ogImage } from "@/lib/og";
import { fetchPublicProfile } from "@/lib/publicProfile";
import { nextRank, rankKey, rankName } from "@/utils/rank";

export const alt = "A public profile on Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Up to three short lines, so a long name never runs under the panel. */
function lines(text: string) {
  const out: string[] = [];
  for (const word of text.split(/\s+/)) {
    const last = out[out.length - 1];
    if (last && `${last} ${word}`.length <= 9)
      out[out.length - 1] = `${last} ${word}`;
    else out.push(word.length > 16 ? `${word.slice(0, 15)}…` : word);
  }
  return out.slice(0, 3);
}

export default async function Image({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const profile = await fetchPublicProfile((await params).handle).catch(
    () => null,
  );
  if (!profile)
    return ogImage({
      eyebrow: "Public profile",
      title: ["Practice,", "in public."],
      panel: {
        label: "Upsolve It",
        value: "—",
        rows: [{ slot: "?", name: "This profile is not public" }],
      },
    });

  const { handle, rating, stats } = profile;
  const next = rating > 0 ? nextRank(rating) : null;
  const key = rankKey(rating);
  return ogImage({
    eyebrow: `Public profile · ${handle}`,
    title: lines(profile.displayName?.trim() || handle),
    panel: {
      label: `${handle} on Codeforces`,
      value: rating > 0 ? String(rating) : "—",
      rows: [
        {
          slot: rankName(rating)[0],
          name: next
            ? `${rankName(rating)} · ${next.min - rating} to ${next.name}`
            : rankName(rating),
          state: key && RANK_HEX[key],
        },
        { slot: String(stats.sessions), name: "Training sessions" },
        { slot: String(stats.solved), name: "Solved in training" },
        {
          slot: String(stats.upsolved),
          name: "Problems upsolved",
          value:
            stats.upsolveTotal > 0
              ? `${Math.round((stats.upsolved / stats.upsolveTotal) * 100)}% of queue`
              : undefined,
        },
        {
          slot: String(stats.currentStreak),
          name: "Day streak",
          value: `best ${stats.longestStreak}`,
        },
      ],
    },
  });
}

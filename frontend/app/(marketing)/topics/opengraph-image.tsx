import { ogImage, RANK_HEX } from "@/lib/og";
import { RANKS } from "@/utils/rank";

export const alt = "Topics by rating — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Topics",
    title: ["Topics.", "By rating."],
    panel: {
      label: "Each topic, cut by rating",
      value: "800–3500",
      // the first five bands a topic's bar is cut at, in their rank colours
      rows: RANKS.slice(0, 5).map((rank, i) => ({
        slot: rank.name[0],
        name: rank.name,
        value: `${Math.max(rank.min, 800)}–${RANKS[i + 1].min - 1}`,
        state: RANK_HEX[rank.key],
      })),
    },
  });
}

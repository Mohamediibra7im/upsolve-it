import { ogImage } from "@/lib/og";
import { RANK_HEX } from "@/lib/og";
import { RANKS } from "@/utils/rank";

export const alt = "The ladder: 110 levels from 900 to 4050 — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "The ladder",
    title: ["One level", "at a time."],
    panel: {
      label: "Where the levels sit",
      value: "900–4050",
      // the first five ranks; each row runs to where the next rank starts
      rows: RANKS.slice(0, 5).map((rank, i) => ({
        slot: rank.name[0],
        name: rank.name,
        value: `${Math.max(rank.min, 900)}–${RANKS[i + 1].min}`,
        state: RANK_HEX[rank.key],
      })),
    },
  });
}

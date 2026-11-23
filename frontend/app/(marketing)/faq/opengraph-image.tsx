import { ogImage } from "@/lib/og";
import { FAQ_GROUPS } from "@/components/features/landing/Faq";

export const alt = "Frequently asked questions — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "FAQ",
    title: ["Questions,", "answered."],
    panel: {
      label: "Short answers",
      value: String(FAQ_GROUPS.reduce((n, group) => n + group.items.length, 0)),
      rows: FAQ_GROUPS.map((group) => ({
        slot: "?",
        name: group.title,
        value: `${group.items.length} ${group.items.length === 1 ? "answer" : "answers"}`,
      })),
    },
  });
}

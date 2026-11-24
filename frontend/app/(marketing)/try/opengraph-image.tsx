import { ogImage } from "@/lib/og";

export const alt = "Solve a problem here, no account needed — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Try it",
    title: ["Solve a", "problem here."],
    panel: {
      label: "No account needed",
      value: "3",
      rows: [
        { slot: "A", name: "Watermelon", value: "Codeforces 4A" },
        { slot: "B", name: "Way Too Long Words", value: "Codeforces 71A" },
        { slot: "C", name: "Product", value: "AtCoder ABC086 A" },
      ],
    },
  });
}

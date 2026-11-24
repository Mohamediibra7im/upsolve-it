import { ogImage, RANK_HEX } from "@/lib/og";

export const alt =
  "Find a problem: Codeforces and AtCoder in one list — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A sample of what the list looks like, not live data.
const ROWS = [
  { slot: "A", name: "Watermelon", value: "800", state: RANK_HEX.newbie },
  {
    slot: "C",
    name: "Registration System",
    value: "1300",
    state: RANK_HEX.pupil,
  },
  {
    slot: "E",
    name: "Dice Product 3",
    value: "1500",
    state: RANK_HEX.specialist,
  },
  {
    slot: "D",
    name: "Xenia and Bit Operations",
    value: "1700",
    state: RANK_HEX.expert,
  },
  { slot: "F", name: "Tree Queries", value: "1900", state: RANK_HEX.cm },
];

export default function Image() {
  return ogImage({
    eyebrow: "Problems",
    title: ["Find a", "problem."],
    panel: { label: "By rating, topic or name", value: "800–3500", rows: ROWS },
  });
}

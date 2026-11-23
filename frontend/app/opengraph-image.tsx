import { ogImage } from "@/lib/og";

export const alt =
  "Upsolve It — Make your next solve count. Competitive programming practice, with a plan.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Practice, with a plan",
    title: ["Make your", "next solve", "count."],
    panel: {
      label: "Example session · Ladder",
      value: "01:12:48",
      rows: [
        {
          slot: "A",
          name: "Two pointers warm-up",
          value: "1000",
          state: "solved",
        },
        {
          slot: "B",
          name: "Greedy with a twist",
          value: "1200",
          state: "solved",
        },
        {
          slot: "C",
          name: "Shortest path, one catch",
          value: "1300",
          state: "failed",
        },
        { slot: "D", name: "DP on prefixes", value: "1500" },
        { slot: "+", name: "Misses go to your upsolve queue" },
      ],
    },
  });
}

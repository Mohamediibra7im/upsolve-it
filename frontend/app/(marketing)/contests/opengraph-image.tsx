import { ogImage } from "@/lib/og";

export const alt = "Upcoming Codeforces and AtCoder rounds — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Contest calendar",
    title: ["Upcoming", "rounds."],
    panel: {
      label: "One schedule",
      value: "2 judges",
      rows: [
        { slot: "CF", name: "Codeforces rounds", value: "your time zone" },
        { slot: "AC", name: "AtCoder contests", value: "your time zone" },
        { slot: "1", name: "Next round", value: "counted down" },
        { slot: "2", name: "After the round", value: "sync" },
        {
          slot: "3",
          name: "Missed problems",
          value: "in your queue",
          state: "#c8f52a",
        },
      ],
    },
  });
}

import { ogImage } from "@/lib/og";

export const alt = "How Upsolve It works: train, miss, upsolve, review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "How it works",
    title: ["Train. Miss.", "Upsolve.", "Review."],
    panel: {
      label: "The loop",
      value: "4 steps",
      rows: [
        { slot: "1", name: "Train on a timed set", value: "at your level" },
        { slot: "2", name: "Miss a problem or two", value: "it happens" },
        {
          slot: "3",
          name: "Upsolve what you missed",
          value: "kept for you",
          state: "#c8f52a",
        },
        { slot: "4", name: "Review the session", value: "see the work" },
      ],
    },
  });
}

import { ogImage } from "@/lib/og";

export const alt = "Upsolve It terms of service";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Terms of service",
    title: ["The terms,", "plainly."],
    panel: {
      label: "In these terms",
      value: "4 parts",
      rows: [
        { slot: "1", name: "Using the platform" },
        { slot: "2", name: "Expected behavior" },
        { slot: "3", name: "Data accuracy" },
        { slot: "4", name: "Account termination" },
      ],
    },
  });
}

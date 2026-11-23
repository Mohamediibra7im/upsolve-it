import { ogImage } from "@/lib/og";

export const alt = "About Upsolve It: free, open source and community built";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "About",
    title: ["Built by", "people who", "compete."],
    panel: {
      label: "Who builds it",
      value: "Free",
      rows: [
        { slot: "1", name: "Built by Mohamed Ibrahim" },
        { slot: "2", name: "Under HNU - FCSIT ICPC Community" },
        { slot: "3", name: "Free to use", state: "solved" },
        { slot: "4", name: "Open source on GitHub", state: "solved" },
      ],
    },
  });
}

import { ogImage } from "@/lib/og";

export const alt = "Contact Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Contact",
    title: ["Get in", "touch."],
    panel: {
      label: "Where to write",
      value: "4 ways",
      rows: [
        { slot: "1", name: "Report a bug", value: "GitHub issues" },
        { slot: "2", name: "Talk to the community", value: "HNU - FCSIT ICPC" },
        { slot: "3", name: "Reach the maintainer", value: "his site" },
        { slot: "4", name: "Report a security problem", value: "privately" },
      ],
    },
  });
}

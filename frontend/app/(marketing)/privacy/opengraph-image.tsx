import { ogImage } from "@/lib/og";

export const alt = "Upsolve It privacy policy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Privacy policy",
    title: ["Your data,", "plainly."],
    panel: {
      label: "In this policy",
      value: "10 parts",
      rows: [
        { slot: "2", name: "What we store" },
        { slot: "4", name: "Who can see it" },
        { slot: "6", name: "Cookies and your browser" },
        { slot: "8", name: "Services we rely on" },
        { slot: "9", name: "Your choices" },
      ],
    },
  });
}

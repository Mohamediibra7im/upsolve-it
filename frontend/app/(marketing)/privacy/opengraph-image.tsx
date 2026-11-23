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
      value: "4 parts",
      rows: [
        { slot: "1", name: "What we collect" },
        { slot: "2", name: "How we protect your data" },
        { slot: "3", name: "Your privacy rights" },
        { slot: "4", name: "Cookies" },
      ],
    },
  });
}

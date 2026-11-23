import { ogImage } from "@/lib/og";
import { MODES } from "@/components/features/landing/modes";

export const alt = "Five ways to train — Upsolve It";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({
    eyebrow: "Training modes",
    title: ["Five ways", "to train."],
    panel: {
      label: "Pick the work you need",
      value: String(MODES.length),
      rows: MODES.map((mode) => ({
        slot: mode.name[0],
        name: mode.name,
        value: `${mode.set} · ${mode.minutes} min`,
      })),
    },
  });
}

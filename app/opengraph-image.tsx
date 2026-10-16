import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { SITE_URL } from "@/lib/seo";

export const alt =
  "Upsolve.it — Make your next solve count. Codeforces practice, with a plan.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  const regular = readFileSync(
    join(process.cwd(), "app/fonts/Montserrat-Regular.ttf"),
  );
  const bold = readFileSync(
    join(process.cwd(), "app/fonts/Montserrat-Bold.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#101214",
        color: "#f1f3ee",
        fontFamily: "Montserrat",
        overflow: "hidden",
      }}
    >
      <svg
        width="760"
        height="800"
        viewBox="0 0 760 800"
        fill="none"
        style={{ position: "absolute", right: -70, top: -165 }}
      >
        <path
          d="M100-90V420C100 560 185 635 310 635C435 635 520 560 520 420V95M350 265L520 95L690 265"
          stroke="#20372a"
          strokeWidth="86"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ position: "absolute", left: 64, top: 48, display: "flex" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="12" fill="#b5e3c4" />
            <path
              d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
              stroke="#183123"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: -1.5 }}>
            upsolve.it
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 190,
          left: 60,
          width: 1080,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1.04,
          letterSpacing: -6,
          textAlign: "center",
        }}
      >
        <span>Make your next</span>
        <span>solve count.</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 94,
          height: 1,
          background: "#34483a",
          display: "flex",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 64,
          bottom: 46,
          fontSize: 19,
          color: "#a6b8ac",
          letterSpacing: -0.4,
        }}
      >
        Codeforces practice, with a plan.
      </span>
      <span
        style={{
          position: "absolute",
          right: 64,
          bottom: 46,
          fontSize: 17,
          color: "#a6b8ac",
          letterSpacing: -0.3,
        }}
      >
        {new URL(SITE_URL).hostname}
      </span>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Montserrat", data: regular, style: "normal", weight: 400 },
        { name: "Montserrat", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
}

import { ImageResponse } from "next/og";
import { SITE_URL } from "./seo";

/** One template for every share image: the page's headline on the left and a
 *  piece of its own interface, tilted on a volt slab, on the right. */

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  ground: "#0b0c0a",
  surface: "#151712",
  sunk: "#1f221b",
  line: "#2b2f26",
  strong: "#6f7665",
  ink: "#f2f4ec",
  muted: "#aab19d",
  volt: "#c8f52a",
  solved: "#4ade80",
  failed: "#ff7a7a",
};

type Font = {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 600 | 800;
  style: "normal";
};

/** The site's own faces, fetched from Google Fonts as TrueType (what the image
 *  renderer reads). A fetch that fails is tried three times: one dropped
 *  request must not fail a build, which draws every share image at once. */
async function googleFont(
  family: string,
  weight: Font["weight"],
): Promise<Font | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const css = await (
        await fetch(
          `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`,
        )
      ).text();
      const url = css.match(
        /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
      )?.[1];
      if (url) {
        return {
          name: family,
          data: await (await fetch(url)).arrayBuffer(),
          weight,
          style: "normal",
        };
      }
    } catch {
      // tried again below
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  return null;
}
const FACES = [
  ["Barlow Condensed", 800],
  ["Barlow", 500],
  ["JetBrains Mono", 600],
] as const;
let fonts: Promise<Font[]> | undefined;
/** Loaded once per process. An incomplete set is not kept, so the next image
 *  asks again instead of inheriting the failure. */
async function loadFonts() {
  fonts ??= Promise.all(
    FACES.map(([family, weight]) => googleFont(family, weight)),
  ).then((loaded) => loaded.filter((f): f is Font => f !== null));
  const loaded = await fonts;
  if (loaded.length < FACES.length) fonts = undefined;
  return loaded;
}

const mono = { fontFamily: "JetBrains Mono", fontWeight: 600 } as const;
const display = {
  fontFamily: "Barlow Condensed",
  fontWeight: 800,
  textTransform: "uppercase",
} as const;

/** The rank colours of app/globals.css, for tiles drawn in an image. */
export const RANK_HEX: Record<string, `#${string}`> = {
  newbie: "#a3a99c",
  pupil: "#5fd068",
  specialist: "#2fd3c6",
  expert: "#8aa4ff",
  cm: "#e383e6",
  master: "#ffa733",
  gm: "#ff6b6b",
};

/** One line of the panel: a slot tile, a name and a value on the right.
 *  `state` colours the tile: solved, failed, or any colour (a rank's). */
export type OgRow = {
  slot: string;
  name: string;
  value?: string;
  state?: "solved" | "failed" | `#${string}`;
};

export type OgPanel = {
  /** Small caps label in the panel's head. */
  label: string;
  /** The big value in the head: a clock, a rating, a count. */
  value: string;
  /** Five rows fill the panel; the last one runs off the edge by design. */
  rows: OgRow[];
};

function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill={C.volt} />
      <path
        d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
        stroke={C.ground}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Panel({ label, value, rows }: OgPanel) {
  return (
    <div
      style={{
        position: "absolute",
        left: 548,
        top: 96,
        width: 612,
        display: "flex",
        flexDirection: "column",
        background: C.surface,
        border: `1px solid ${C.strong}`,
        borderRadius: 6,
        transform: "rotate(-5deg)",
        boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 28px",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <span
          style={{
            ...mono,
            fontSize: 16,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.muted,
          }}
        >
          {label}
        </span>
        <span style={{ ...mono, fontSize: 34 }}>{value}</span>
      </div>
      {rows.slice(0, 5).map((row) => {
        const fill =
          row.state === "solved"
            ? C.solved
            : row.state?.startsWith("#")
              ? row.state
              : C.sunk;
        return (
          <div
            key={row.slot + row.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 28px",
              borderBottom: `1px solid ${C.line}`,
            }}
          >
            <span
              style={{
                ...mono,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 46,
                borderRadius: 3,
                fontSize: 19,
                background: fill,
                color: fill === C.sunk ? C.ink : C.ground,
                border:
                  row.state === "failed" ? `2px solid ${C.failed}` : "none",
              }}
            >
              {row.slot}
            </span>
            <span style={{ flex: 1, fontSize: 25, whiteSpace: "nowrap" }}>
              {row.name}
            </span>
            {row.value ? (
              <span style={{ ...mono, fontSize: 21, color: C.muted }}>
                {row.value}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export async function ogImage({
  eyebrow,
  title,
  panel,
}: {
  eyebrow: string;
  /** Lines of the headline; two or three short ones read best. */
  title: string[];
  panel: OgPanel;
}) {
  // The headline has 470px before the panel: size it to its longest line.
  const longest = Math.max(...title.map((line) => line.length));
  const titleSize = Math.min(104, Math.floor(470 / (longest * 0.5)));

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: C.ground,
        color: C.ink,
        fontFamily: "Barlow",
        fontWeight: 500,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 610,
          top: 170,
          width: 720,
          height: 560,
          display: "flex",
          background: C.volt,
          transform: "rotate(-5deg)",
        }}
      />
      <Panel {...panel} />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 56,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <Mark size={44} />
        <div style={{ display: "flex", fontSize: 31, letterSpacing: -1.4 }}>
          <span>Upsolve</span>
          <span style={{ marginLeft: 7, color: C.volt }}>It</span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 214,
          width: 480,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            ...mono,
            fontSize: 17,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: C.volt,
          }}
        >
          {eyebrow}
        </span>
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: 20 }}
        >
          {title.map((line) => (
            <span
              key={line}
              style={{
                ...display,
                fontSize: titleSize,
                lineHeight: 0.9,
                whiteSpace: "nowrap",
              }}
            >
              {line}
            </span>
          ))}
        </div>
      </div>
      <span
        style={{
          ...mono,
          position: "absolute",
          left: 64,
          bottom: 50,
          fontSize: 17,
          letterSpacing: 1,
          color: C.muted,
        }}
      >
        {new URL(SITE_URL).hostname}
      </span>
    </div>,
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}

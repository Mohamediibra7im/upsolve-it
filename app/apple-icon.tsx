import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#101214",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#b5e3c4" />
        <path
          d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
          stroke="#183123"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>,
    size,
  );
}

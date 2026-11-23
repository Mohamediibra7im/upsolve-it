import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(
    <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="12" fill="#c8f52a" />
      <path
        d="M10 12v12a7 7 0 0 0 14 0V10m-6 6 6-6 6 6"
        stroke="#0b0c0a"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
    size,
  );
}

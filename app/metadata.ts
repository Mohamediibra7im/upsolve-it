import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upsolve.it - Practice, Track and Dominate",
  description:
    "The ultimate command center for competitive programmers. Master Codeforces with intelligent practice sessions, track your evolution, and dominate the competitive programming ladder.",
  metadataBase: new URL("https://upsolve-it.hnuicpc.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Upsolve.it - Practice, Track and Dominate",
    description: "The ultimate command center for competitive programmers. Master Codeforces with intelligent practice sessions, track your evolution, and dominate the competitive programming ladder.",
    url: "https://upsolve-it.hnuicpc.tech",
    siteName: "Upsolve.it",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upsolve.it - Practice, Track and Dominate",
    description: "The ultimate command center for competitive programmers. Master Codeforces with intelligent practice sessions, track your evolution, and dominate the competitive programming ladder.",
  },
  keywords: [
    "Upsolve.it",
    "Codeforces",
    "competitive programming",
    "cp training",
    "upsolve",
    "HNU ICPC",
    "virtual contest",
    "algorithm practice",
  ],
  authors: [{ name: "Mohammed Ibrahim" }],
  creator: "Upsolve.it",
  publisher: "Upsolve.it",
  other: {
    "google-site-verification": "XjpRVCB0RZUnqyBmFpZUGs8AdwIHbw4WXqEoBPxvnN0",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

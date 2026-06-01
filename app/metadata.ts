import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upsolve.it - Practice Redefined",
  description:
    "Master competitive programming with intelligent practice sessions, track your progress, and climb the Codeforces ladder with Upsolve.it.",
  metadataBase: new URL("https://upsolve-it.hnuicpc.tech"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Upsolve.it - Practice Redefined",
    description: "Intelligence-driven training for competitive programmers. Optimize your upsolve flow and track tactical metrics.",
    url: "https://upsolve-it.hnuicpc.tech",
    siteName: "Upsolve.it",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upsolve.it - Practice Redefined",
    description: "Intelligence-driven training for competitive programmers.",
  },
  keywords: [
    "Upsolve.it",
    "Codeforces",
    "competitive programming",
    "cp training",
    "upsolve",
    "HNU ICPC",
  ],
  authors: [{ name: "Mohammed Ibrahim" }],
  creator: "Upsolve.it",
  publisher: "Upsolve.it",
  other: {
    "google-site-verification": "FrZhoocCX8UYIlAOJ52uTw_h2qeeBIshrKH5E_i4qT0",
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

import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_TITLE,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SOCIAL_TITLE,
    description: SITE_DESCRIPTION,
  },
  authors: [{ name: "Mohamed Ibrahim", url: "https://mohamediibrahim.dev/" }],
  category: "education",
  keywords: [
    "Codeforces",
    "upsolving",
    "competitive programming",
    "competitive programming training",
    "virtual contest",
    "ICPC practice",
    "problem ladder",
  ],
  creator: SITE_NAME,
  publisher: "HNU - FCSIT ICPC Community",
  verification: { google: "XjpRVCB0RZUnqyBmFpZUGs8AdwIHbw4WXqEoBPxvnN0" },
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

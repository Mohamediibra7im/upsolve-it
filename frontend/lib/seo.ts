import type { Metadata } from "next";

export const SITE_URL = "https://upsolve-it.hnuicpc.tech";
export const SITE_NAME = "Upsolve.it";
export const SITE_TITLE = "Upsolve.it — Codeforces Practice & Training";
export const SOCIAL_TITLE = "Make your next solve count. | Upsolve.it";
export const SITE_DESCRIPTION =
  "Build Codeforces training sessions, revisit the problems you could not solve, and track your progress. Free and community built.";

export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export const PUBLIC_PAGES = {
  "/": { title: SITE_TITLE, description: SITE_DESCRIPTION },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "Learn how Upsolve.it handles account information, Codeforces profile data, training history, and other information you share with the platform.",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "Read the terms for using Upsolve.it, including account responsibilities, acceptable use, Codeforces integration, and community participation.",
  },
} as const;

export type PublicPagePath = keyof typeof PUBLIC_PAGES;

/** Public pages share one origin and image while retaining their own canonical and copy. */
export function publicPageMetadata(path: PublicPagePath): Metadata {
  const page = PUBLIC_PAGES[path];
  const title = path === "/" ? SITE_TITLE : `${page.title} | ${SITE_NAME}`;
  const socialTitle = path === "/" ? SOCIAL_TITLE : title;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: new URL(path, SITE_URL).toString() },
    openGraph: {
      title: socialTitle,
      description: page.description,
      url: new URL(path, SITE_URL).toString(),
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: new URL("/opengraph-image", SITE_URL).toString(),
          width: 1200,
          height: 630,
          alt: "Upsolve.it — Make your next solve count. Codeforces practice, with a plan.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      images: [
        {
          url: new URL("/opengraph-image", SITE_URL).toString(),
          alt: "Upsolve.it — Make your next solve count.",
        },
      ],
    },
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
}

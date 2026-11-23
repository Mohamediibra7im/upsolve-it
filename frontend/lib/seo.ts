import type { Metadata } from "next";

export const SITE_URL = "https://upsolve-it.hnuicpc.tech";
export const SITE_NAME = "Upsolve It";
export const SITE_TITLE =
  "Upsolve It — Competitive Programming Practice, With a Plan";
export const SOCIAL_TITLE = "Make your next solve count. | Upsolve It";
export const SITE_DESCRIPTION =
  "Train on timed problem sets built around your rating, keep every problem you miss in one upsolve queue, and watch your streaks and performance grow. Works with Codeforces today. Free and open source.";

export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export const PUBLIC_PAGES = {
  "/": { title: SITE_TITLE, description: SITE_DESCRIPTION },
  "/modes": {
    title: "Training Modes",
    description:
      "The five Upsolve It training modes: Ladder, Weakness, Speed round, Contest and Endurance, with the set size, time limit and rating range of each.",
  },
  "/ladder": {
    title: "The Ladder",
    description:
      "110 ladder levels with target ratings from 900 to 4050, shown against the Codeforces ranks, and how a four-problem ladder set is built.",
  },
  "/how-it-works": {
    title: "How It Works",
    description:
      "Train on a timed problem set, keep the problems you missed in one upsolve queue, solve them later, and review your streaks and sessions.",
  },
  "/faq": {
    title: "FAQ",
    description:
      "Short answers about Upsolve It: Codeforces handle verification, training sessions, where the upsolve queue comes from, and the weekly reminder email.",
  },
  "/about": {
    title: "About",
    description:
      "Upsolve It is a free training tracker for competitive programmers, built in the open under the HNU - FCSIT ICPC Community by Mohamed Ibrahim. How to report a bug or contribute.",
  },
  "/contact": {
    title: "Contact",
    description:
      "How to reach the people behind Upsolve It: report a bug on GitHub, talk to the HNU - FCSIT ICPC Community, contact the maintainer, or report a security problem privately.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "Learn how Upsolve It handles account information, Codeforces profile data, training history, and other information you share with the platform.",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "Read the terms for using Upsolve It, including account responsibilities, acceptable use, Codeforces integration, and community participation.",
  },
} as const;

export type PublicPagePath = keyof typeof PUBLIC_PAGES;

/** Canonical URL and copy for a public page. Its share image is the
 *  opengraph-image.tsx beside the page, which Next adds to the tags itself. */
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
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
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

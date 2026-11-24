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
  "/problems": {
    title: "Problems",
    description:
      "Browse Codeforces and AtCoder problems in one list: filter by judge, rating range and topic, search by name or id, and open any problem on its own judge.",
  },
  "/topics": {
    title: "Topics",
    description:
      "Every Codeforces topic tag with its problem count and how its problems spread across the rating bands, from 800 to 3500. Each topic links to its problems.",
  },
  "/how-it-works": {
    title: "How It Works",
    description:
      "Train on a timed problem set, keep the problems you missed in one upsolve queue, solve them later, and review your streaks and sessions.",
  },
  "/try": {
    title: "Try a Problem",
    description:
      "Solve a real competitive programming problem in the Upsolve It workspace without an account: read the statement, write your code and run it on the samples.",
  },
  "/faq": {
    title: "FAQ",
    description:
      "Short answers about Upsolve It: Codeforces handle verification, training sessions, where the upsolve queue comes from, and the weekly reminder email.",
  },
  "/contests": {
    title: "Contest Calendar",
    description:
      "Upcoming Codeforces and AtCoder rounds in one list, with start times in your own time zone, a countdown to the next round, and each round's length.",
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
  // The home page's image is app/opengraph-image.tsx, one level above the
  // page, and a page's own openGraph replaces what its parents set. So the
  // home page names it. Every other page has its image beside it.
  const images =
    path === "/"
      ? [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }]
      : undefined;
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
      ...(images && { images }),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
      ...(images && { images }),
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

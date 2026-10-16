import type { Metadata } from "next";

export const SITE_URL = "https://upsolve-it.hnuicpc.tech";
export const SITE_NAME = "Upsolve.it";
export const SITE_TITLE = "Upsolve.it — Codeforces Practice & Training";
export const SOCIAL_TITLE = "Make your next solve count. | Upsolve.it";
export const SITE_DESCRIPTION =
  "Build Codeforces training sessions, follow a competitive programming roadmap, revisit unsolved problems, and track your progress. Free and community built.";

export const NO_INDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export const PUBLIC_PAGES = {
  "/": { title: SITE_TITLE, description: SITE_DESCRIPTION },
  "/docs": {
    title: "Codeforces Practice Guide",
    description:
      "Learn how to set up training sessions, use the learning roadmap, revisit unsolved Codeforces problems, and understand your progress in Upsolve.it.",
  },
  "/help": {
    title: "Help Center",
    description:
      "Find practical guides and answers about Codeforces training, account verification, upsolving, and tracking your progress with Upsolve.it.",
  },
  "/help/quick-start": {
    title: "Get Started with Codeforces Training",
    description:
      "Connect your Codeforces profile, choose a training mode, build your first problem set, and start a consistent practice routine with Upsolve.it.",
  },
  "/help/faq": {
    title: "Frequently Asked Questions",
    description:
      "Get answers about Upsolve.it accounts, Codeforces verification, training modes, problem ratings, statistics, and your upsolve list.",
  },
  "/help/support": {
    title: "Contact Support",
    description:
      "Get help with your Upsolve.it account or training sessions. Report a problem, share feedback, or find the HNU ICPC community’s support channels.",
  },
  "/community": {
    title: "Community & Code of Conduct",
    description:
      "Meet the values behind the HNU ICPC community: fair practice, respectful discussion, and helping competitive programmers learn together.",
  },
  "/levels": {
    title: "Codeforces Practice Levels",
    description:
      "Browse training levels by problem rating and difficulty. Find a focused Codeforces problem set that gives you the right amount of challenge.",
  },
  "/leaderboard": {
    title: "Competitive Programming Leaderboard",
    description:
      "Explore the Upsolve.it community’s weekly, monthly, and all-time learning rankings. See the progress competitive programmers are making.",
  },
  "/suggestions": {
    title: "Competitive Programming Resources",
    description:
      "Explore community-curated websites and resources for competitive programming, algorithm learning, and Codeforces practice.",
  },
  "/whats-new": {
    title: "Product Updates & Release Notes",
    description:
      "See what’s new in Upsolve.it, including improvements to Codeforces training, the learning roadmap, upsolving, and progress tracking.",
  },
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicProfileView, {
  type PublicProfile,
} from "@/components/features/profile/PublicProfileView";
import { fetchPublicProfile } from "@/lib/publicProfile";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ handle: string }> };

const plural = (n: number, word: string) => `${word}${n === 1 ? "" : "s"}`;
const count = (n: number, word: string) =>
  `${n.toLocaleString("en-US")} ${plural(n, word)}`;

/** The profile, or the 404 page for a handle that is unknown or not public. */
async function loadProfile(handle: string): Promise<PublicProfile> {
  return (await fetchPublicProfile(handle)) ?? notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle, stats } = await loadProfile((await params).handle);
  const title = `${handle} on ${SITE_NAME}`;
  const description = `${handle} has trained for ${count(stats.sessions, "session")} on ${SITE_NAME}: ${count(stats.solved, "problem")} solved in training, ${stats.upsolved.toLocaleString("en-US")} upsolved, and a longest streak of ${count(stats.longestStreak, "day")}.`;
  const url = new URL(`/u/${handle}`, SITE_URL).toString();
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "profile",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  return (
    <PublicProfileView profile={await loadProfile((await params).handle)} />
  );
}

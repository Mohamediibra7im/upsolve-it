import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your profile",
  description:
    "Your Codeforces rating, your next rank and your practice numbers.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page() {
  return <ClientPage />;
}

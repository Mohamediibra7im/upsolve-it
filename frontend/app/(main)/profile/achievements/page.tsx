import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your achievements",
  description:
    "The practice milestones you have earned and how far the next ones are.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page() {
  return <ClientPage />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your activity",
  description:
    "Your practice activity over the last year and your most recent sessions.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page() {
  return <ClientPage />;
}

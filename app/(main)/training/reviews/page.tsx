import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Training history",
  description:
    "Revisit your completed training sessions, results, and problem reviews.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your statistics",
  description:
    "Review your practice activity, problem-solving progress, and training results.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

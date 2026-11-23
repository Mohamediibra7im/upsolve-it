import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your upsolve list",
  description:
    "Return to unfinished problems, organize your practice, and track every follow-up solve.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

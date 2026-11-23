import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Friends",
  description:
    "Follow friends and compare your competitive programming progress.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

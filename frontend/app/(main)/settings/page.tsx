import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Reminder emails, password, handle verification and your public profile.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page() {
  return <ClientPage />;
}

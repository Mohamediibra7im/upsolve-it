import ClientPage from "./page.client";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Your profile",
  description:
    "Manage your Codeforces profile, account details, and practice preferences.",
  robots: NO_INDEX_ROBOTS,
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

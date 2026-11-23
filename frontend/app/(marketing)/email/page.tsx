import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import EmailLinkClient from "./page.client";

export const metadata: Metadata = {
  title: "Email reminders",
  robots: NO_INDEX_ROBOTS,
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; token?: string }>;
}) {
  const { action, token } = await searchParams;
  return <EmailLinkClient action={action} token={token} />;
}

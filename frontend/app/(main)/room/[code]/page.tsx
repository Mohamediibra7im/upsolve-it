import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import ClientPage from "./page.client";

export const metadata: Metadata = {
  title: "Training room",
  description: "A shared training session: the same problems and one clock.",
  robots: NO_INDEX_ROBOTS,
};

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ClientPage code={code} />;
}

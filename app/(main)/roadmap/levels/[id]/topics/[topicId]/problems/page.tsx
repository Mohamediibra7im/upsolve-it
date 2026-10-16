import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { NO_INDEX_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Session problems",
  description:
    "Practice the problems in this learning session and track your completed solves.",
  robots: NO_INDEX_ROBOTS,
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  redirect(`/roadmap/levels/${id}/topics/${topicId}`);
}

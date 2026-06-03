import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topic Problems | Upsolve.it",
  description: "Practice problems matching your roadmap level and topic.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>;
}) {
  const { id, topicId } = await params;
  redirect(`/roadmap/levels/${id}/topics/${topicId}`);
}

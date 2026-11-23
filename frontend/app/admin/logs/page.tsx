import type { Metadata } from "next";
import { AdminLogsView } from "@/components/features/admin";

export const metadata: Metadata = {
  title: "Logs",
  description: "Review admin actions and changes across the platform.",
};

export default function Page() {
  return <AdminLogsView />;
}

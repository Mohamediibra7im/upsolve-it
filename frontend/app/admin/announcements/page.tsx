import type { Metadata } from "next";
import AdminAnnouncements from "@/components/features/admin/AdminAnnouncements";

export const metadata: Metadata = {
  title: "Announcements",
  description: "Write the announcements visitors see when they open the site.",
};

export default function Page() {
  return <AdminAnnouncements />;
}

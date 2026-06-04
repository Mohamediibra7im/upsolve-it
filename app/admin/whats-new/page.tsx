import AdminWhatsNew from "@/components/features/admin/AdminWhatsNew";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New Management | Admin Hub",
  description: "Create, edit, delete, and publish platform release notes and changelog entries.",
};

export default function AdminWhatsNewRoute() {
  return <AdminWhatsNew />;
}

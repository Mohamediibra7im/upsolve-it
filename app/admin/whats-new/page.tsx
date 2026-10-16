import AdminWhatsNew from "@/components/features/admin/AdminWhatsNew";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product update management",
  description: "Write, preview, and publish product updates for the community.",
};

export default function AdminWhatsNewRoute() {
  return <AdminWhatsNew />;
}

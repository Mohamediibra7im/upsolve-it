import AdminContactMessages from "@/components/features/admin/AdminContactMessages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Messages | Admin Hub",
  description: "View and manage incoming support messages.",
};

export default function AdminContactRoute() {
  return <AdminContactMessages />;
}

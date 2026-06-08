import AdminSuggestions from "@/components/features/admin/AdminSuggestions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggestions Management | Admin Hub",
  description: "Manage suggested websites and resources for users.",
};

export default function AdminSuggestionsRoute() {
  return <AdminSuggestions />;
}

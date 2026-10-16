import AdminSuggestions from "@/components/features/admin/AdminSuggestions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resource management",
  description:
    "Curate the guides, websites, and tools recommended to community members.",
};

export default function AdminSuggestionsRoute() {
  return <AdminSuggestions />;
}

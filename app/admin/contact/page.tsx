import AdminContactMessages from "@/components/features/admin/AdminContactMessages";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support inbox",
  description:
    "Read community questions and feedback, and manage support replies.",
};

export default function AdminContactRoute() {
  return <AdminContactMessages />;
}

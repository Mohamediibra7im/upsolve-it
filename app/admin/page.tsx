import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Upsolve.it",
  description: "Admin console for Upsolve.it platform management.",
};

export default function AdminPage() {
  redirect("/admin/dashboard");
}

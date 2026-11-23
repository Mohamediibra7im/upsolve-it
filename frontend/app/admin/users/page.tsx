import type { Metadata } from "next";
import { AdminUserManagement } from "@/components/features/admin";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users, admin roles and Codeforces ratings.",
};

export default function Page() {
  return <AdminUserManagement />;
}

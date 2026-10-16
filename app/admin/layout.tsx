import type { ReactNode } from "react";
import AdminLayoutClient from "./layout.client";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

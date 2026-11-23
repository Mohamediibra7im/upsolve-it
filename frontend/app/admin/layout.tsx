import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NO_INDEX_ROBOTS } from "@/lib/seo";
import AdminLayoutClient from "./layout.client";

export const metadata: Metadata = {
  robots: NO_INDEX_ROBOTS,
};

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

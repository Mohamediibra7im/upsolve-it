import type { Metadata } from "next";
import ClientPage from "./page.client";

export const metadata: Metadata = {
  title: "Admin overview",
  description: "Users, sessions and solve rates across the platform.",
};

export default function Page() {
  return <ClientPage />;
}

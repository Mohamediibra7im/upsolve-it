import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Upsolve.it",
  description: "Admin dashboard overview and statistics.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Levels Management | Upsolve.it Admin",
  description: "Manage difficulty levels and curriculum.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

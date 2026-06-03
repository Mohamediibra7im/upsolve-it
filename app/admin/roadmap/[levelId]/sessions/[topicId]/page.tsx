import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Detail | Upsolve.it Admin",
  description: "Manage session video, problems, and materials.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap Management | Upsolve.it Admin",
  description: "Manage roadmap levels and curriculum structure.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

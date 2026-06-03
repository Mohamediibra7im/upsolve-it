import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Level Topics | Upsolve.it Admin",
  description: "Manage topics and sessions for this roadmap level.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

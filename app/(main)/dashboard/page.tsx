import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Upsolve.it",
  description: "Your competitive programming command center dashboard.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

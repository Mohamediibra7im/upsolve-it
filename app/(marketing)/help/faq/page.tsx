import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Knowledge Base | Upsolve.it",
  description: "Frequently asked questions and detailed guide for competitive programming practice on Upsolve.it.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

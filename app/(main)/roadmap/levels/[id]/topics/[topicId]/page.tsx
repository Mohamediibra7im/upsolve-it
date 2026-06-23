import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap Topic | Upsolve.it",
  description: "Interactive learning materials and problems for your roadmap topic.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

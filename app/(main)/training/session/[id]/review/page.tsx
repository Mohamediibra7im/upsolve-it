import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Review | Upsolve.it",
  description: "Review your virtual contest training session performance and analytics.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

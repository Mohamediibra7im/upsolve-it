import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Levels | Upsolve.it",
  description: "Practice problems grouped by difficulty levels and categories.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

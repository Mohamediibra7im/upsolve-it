import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upsolve.it | Competitive Programming Command Center",
  description: "A virtual contest and practice platform for competitive programming. Track progress, upsolve efficiently, and reach your target rating.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bug Report | Upsolve.it",
  description: "Report bugs, issues, or request features for the Upsolve.it platform.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

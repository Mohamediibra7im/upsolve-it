import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Upsolve.it",
  description: "Terms and conditions for utilizing the Upsolve.it platform.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

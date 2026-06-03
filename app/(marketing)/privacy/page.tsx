import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Upsolve.it",
  description: "Privacy protocol and data safety information for Upsolve.it.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

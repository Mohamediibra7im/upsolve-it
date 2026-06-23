import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Login | Upsolve.it",
  description: "Access your training dashboard and sync your Codeforces progress.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

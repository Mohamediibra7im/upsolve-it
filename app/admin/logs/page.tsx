import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logs | Upsolve.it Admin",
  description: "View platform activity logs.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

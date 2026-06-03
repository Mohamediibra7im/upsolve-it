import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management | Upsolve.it Admin",
  description: "Manage platform users and roles.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

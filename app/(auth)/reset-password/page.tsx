import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Upsolve.it",
  description: "Reset your account password secure protocol.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

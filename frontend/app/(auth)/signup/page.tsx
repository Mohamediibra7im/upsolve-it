import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create your Upsolve.it account with a Codeforces handle and begin your practice.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Upsolve.it",
  description: "Register your handle and begin your personalized training roadmap.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

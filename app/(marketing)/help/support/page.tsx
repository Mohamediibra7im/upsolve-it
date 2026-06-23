import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | Upsolve.it",
  description: "Contact support for any issues or feedback regarding the platform.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

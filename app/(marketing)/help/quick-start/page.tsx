import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Start Guide | Upsolve.it",
  description: "Get started with your competitive programming training on Upsolve.it.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

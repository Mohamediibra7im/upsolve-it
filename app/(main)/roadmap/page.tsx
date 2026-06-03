import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training Roadmap | Upsolve.it",
  description: "Step-by-step competitive programming training roadmap based on your rating.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

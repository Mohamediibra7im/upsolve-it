import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics & Statistics | Upsolve.it",
  description: "Detailed analysis of your competitive programming rating, speed, accuracy, and performance.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

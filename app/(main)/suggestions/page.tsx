import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suggestions | Upsolve.it",
  description: "Curated collection of useful websites and resources for competitive programming.",
};

export default function Page() {
  return <ClientPage />;
}

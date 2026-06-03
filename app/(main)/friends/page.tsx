import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friends & Rivals | Upsolve.it",
  description: "Compare progress, track friends, and level up together.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

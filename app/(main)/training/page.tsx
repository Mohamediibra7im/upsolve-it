import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training Center | Upsolve.it",
  description: "Practice virtual contests, choose problem ratings, and track training sessions.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

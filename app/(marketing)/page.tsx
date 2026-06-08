import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upsolve.it | Level Up Your Competitive Programming",
  description: "Train smarter with curated problem sets, track your weaknesses, and climb the rating ladder. Your personal coach for Codeforces and beyond.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

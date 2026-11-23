import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opening Your Dashboard",
  description: "Open your Upsolve It practice dashboard.",
  robots: { index: false, follow: true },
};

export default function Page() {
  redirect("/dashboard");
}

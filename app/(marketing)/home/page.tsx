import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | Upsolve.it",
  description: "Your competitive programming command center.",
};

export default function Page() {
  redirect("/dashboard");
}

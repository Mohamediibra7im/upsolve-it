import type { Metadata } from "next";
import { AuthForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create your Upsolve It account with a Codeforces handle and begin your practice.",
};

export default function Page() {
  return <AuthForm mode="signup" />;
}

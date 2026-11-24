import type { Metadata } from "next";
import { SignupSteps } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create your Upsolve It account, connect your judges and begin your practice.",
};

export default function Page() {
  return <SignupSteps />;
}

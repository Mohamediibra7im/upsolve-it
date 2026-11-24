import type { Metadata } from "next";
import { LoginStage } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to continue your practice and review your progress.",
};

export default function Page() {
  return <LoginStage />;
}

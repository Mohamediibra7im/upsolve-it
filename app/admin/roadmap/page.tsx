import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap management",
  description:
    "Organize roadmap levels, publishing settings, and member access.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

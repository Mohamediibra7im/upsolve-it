import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to continue your Codeforces practice and review your progress.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning session management",
  description:
    "Organize the learning sessions and requirements for this roadmap level.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

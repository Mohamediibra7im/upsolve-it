import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activity log",
  description:
    "Review administrative activity and changes across the platform.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

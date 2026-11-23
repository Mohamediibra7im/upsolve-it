import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin overview",
  description:
    "Review community activity, training progress, and platform statistics.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member management",
  description:
    "Manage community members, account roles, and Codeforces profile information.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

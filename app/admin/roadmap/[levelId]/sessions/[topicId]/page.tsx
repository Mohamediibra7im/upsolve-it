import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session editor",
  description:
    "Manage learning resources, practice problems, and completion requirements for this session.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

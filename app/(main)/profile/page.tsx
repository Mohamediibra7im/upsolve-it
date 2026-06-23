import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile | Upsolve.it",
  description: "View your profile, handle details, and competitive programming statistics.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

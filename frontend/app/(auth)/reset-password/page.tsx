import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password",
  description:
    "Verify your Codeforces account and choose a new Upsolve.it password.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

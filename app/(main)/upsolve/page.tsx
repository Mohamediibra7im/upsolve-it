import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upsolve List | Upsolve.it",
  description: "Your personal upsolving list of unsolved problems from virtual contests.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

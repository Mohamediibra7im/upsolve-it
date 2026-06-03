import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap Level | Upsolve.it",
  description: "Level training roadmap and progress tracking.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

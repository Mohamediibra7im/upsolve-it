import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ICPC Community | Upsolve.it",
  description: "Connect with competitive programmers from the FCSIT ICPC community.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

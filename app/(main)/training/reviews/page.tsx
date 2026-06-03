import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Past Reviews | Upsolve.it",
  description: "View all your past training session reviews and solved problems.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

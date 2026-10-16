import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training level settings",
  description:
    "Configure training difficulty, target ratings, and session durations.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | Upsolve.it",
  description: "Top competitive programmers on the Upsolve.it platform ranked by level and rating.",
};

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

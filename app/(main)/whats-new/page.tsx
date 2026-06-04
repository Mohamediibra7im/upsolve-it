import WhatsNewPage from "@/components/features/whats-new/WhatsNewPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New | Upsolve.it",
  description: "Stay up-to-date with the latest features, releases, and platform enhancements for the HNU FCSIT ICPC Community.",
};

export default function WhatsNewRoute() {
  return <WhatsNewPage />;
}

import { publicPageMetadata } from "@/lib/seo";
import TryClient from "./page.client";

export const metadata = publicPageMetadata("/try");

export default function Page() {
  return <TryClient />;
}

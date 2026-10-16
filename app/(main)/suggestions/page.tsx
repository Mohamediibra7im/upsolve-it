import { publicPageMetadata } from "@/lib/seo";
import ClientPage from "./page.client";

export const metadata = publicPageMetadata("/suggestions");

export default function Page() {
  return <ClientPage />;
}

import JsonLd from "@/components/shared/JsonLd";
import { siteStructuredData } from "@/lib/siteStructuredData";
import { publicPageMetadata } from "@/lib/seo";
import ClientPage from "./page.client";

export const metadata = publicPageMetadata("/");

export default function Page() {
  return (
    <>
      <JsonLd data={siteStructuredData} />
      <ClientPage />
    </>
  );
}

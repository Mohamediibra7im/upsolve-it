import { publicPageMetadata } from "@/lib/seo";
import ClientPage from "./page.client";

export const metadata = publicPageMetadata("/community");

export default function Page(props: any) {
  return <ClientPage {...props} />;
}

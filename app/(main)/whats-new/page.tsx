import { publicPageMetadata } from "@/lib/seo";
import WhatsNewPage from "@/components/features/whats-new/WhatsNewPage";

export const metadata = publicPageMetadata("/whats-new");

export default function WhatsNewRoute() {
  return <WhatsNewPage />;
}

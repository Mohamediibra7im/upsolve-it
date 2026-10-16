import { publicPageMetadata } from "@/lib/seo";
import { HelpCenter } from "@/components/features/help";

export const metadata = publicPageMetadata("/help");

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-5 py-12 sm:px-8 sm:py-16">
        <HelpCenter />
      </div>
    </div>
  );
}

"use client";

import { QuickStartGuide } from "@/components/features/help";
import { useRouter } from "next/navigation";

export default function QuickStartPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <QuickStartGuide onBack={() => router.push("/help")} />
      </div>
    </div>
  );
}

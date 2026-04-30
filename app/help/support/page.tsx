"use client";

import SupportContact from "../_Components/SupportContact";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen py-12 sm:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <SupportContact onBack={() => router.push("/help")} />
      </div>
    </div>
  );
}

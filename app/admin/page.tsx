'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return <Loader message="Redirecting to Admin Console..." />;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {useUser} from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import { Dashboard } from "@/components/features/dashboard";

export default function DashboardClient() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <Loader message="Verifying session..." />;
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
}

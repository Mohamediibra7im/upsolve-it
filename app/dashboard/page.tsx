"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import Loader from "@/components/shared/Loader";
import Dashboard from "@/app/_Components/Dashboard";

export default function DashboardPage() {
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

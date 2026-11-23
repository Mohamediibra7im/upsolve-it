"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/auth";
import Loader from "@/components/shared/Loader";
import SiteShell from "@/components/layout/SiteShell";

export default function AdminLayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const isAuthorized = user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAuthorized) router.replace("/");
  }, [isLoading, isAuthorized, router]);

  if (isLoading || !isAuthorized)
    return <Loader message="Checking your access…" />;

  return (
    <SiteShell app admin>
      {children}
    </SiteShell>
  );
}

"use client";

import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { AdminDashboardView } from "@/components/features/admin";
import { AdminState, AdminRetry } from "@/components/features/admin/AdminState";
import { PageHead } from "@/components/ui/kit";

export default function AdminDashboardClient() {
  const { stats, isLoading, isError, mutate } = useAdminStats();

  return (
    <>
      <PageHead eyebrow="Admin" title="Overview" />
      {isError ? (
        <AdminState
          tone="error"
          title="The overview did not load"
          description="The statistics service did not answer. Try again in a minute."
          action={<AdminRetry onRetry={() => mutate()} />}
        />
      ) : (
        <AdminDashboardView stats={stats} statsLoading={isLoading} />
      )}
    </>
  );
}

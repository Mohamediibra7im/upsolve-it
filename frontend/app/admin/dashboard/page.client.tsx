"use client";

import { useAdminStats } from "@/hooks/admin/useAdminStats";
import { AdminDashboardView } from "@/components/features/admin";
import { AdminState, AdminRetry } from "@/components/features/admin/AdminState";
import { m } from "framer-motion";

export default function AdminDashboardClient() {
  const { stats, isLoading, isError, mutate } = useAdminStats();

  if (isError)
    return (
      <AdminState
        tone="error"
        title="Could not load the overview"
        description="Community statistics are temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );

  return (
    <div className="space-y-6">
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdminDashboardView stats={stats} statsLoading={isLoading} />
      </m.div>
    </div>
  );
}

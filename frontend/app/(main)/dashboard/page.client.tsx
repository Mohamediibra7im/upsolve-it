"use client";

import { Dashboard } from "@/components/features/dashboard";

// Auth is handled by AuthGuard in the root layout — no need to re-check here.
export default function DashboardClient() {
  return <Dashboard />;
}
